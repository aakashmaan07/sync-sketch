"use client";
import { nanoid } from "nanoid";
import { useCallback, useMemo, useState } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
// import { useSelf } from "@liveblocks/react/suspense";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { CursorsPresence } from "./cursors-presence";
import {
  connectionIdToColor,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { useOthersMapped } from "@liveblocks/react/suspense";
import { SelectionBox } from "./selection-box";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  // const info = useSelf((me) => me.info);
  const layerIds = useStorage((root) => root.layerIds);

  const [CanvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 255,
    g: 255,
    b: 255,
  });

  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }
      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });
      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  const translateSelectedLayers=useMutation((
    {storage,self},
    point:Point,
  )=>{
    if(CanvasState.mode!=CanvasMode.Translating){
      return;
    }

    const offset={
      x:point.x-CanvasState.current.x,
      y:point.y-CanvasState.current.y,
    };

    const liveLayers=storage.get("layers");

    for(const id of self.presence.selection){
      const layer=liveLayers.get(id);
      if(layer){
        layer.update({
          x:layer.get("x")+offset.x,
          y:layer.get("y")+offset.y,
        });
      }
    }

    setCanvasState({mode:CanvasMode.Translating,current:point});

  },[CanvasState]);

  const unselectLayers=useMutation((
    {self,setMyPresence}
  )=>{
    if(self.presence.selection.length > 0){
      setMyPresence({selection:[]},{addToHistory:true});
    }
  },[])

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (CanvasState.mode !== CanvasMode.Resizing) {
        return;
      }
      const bounds = resizeBounds(
        CanvasState.initialBounds,
        CanvasState.corner,
        point
      );
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        layer.update(bounds);
      }
    },
    [CanvasState]
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    // console.log({
    //   x: e.deltaX,
    //   y: e.deltaY,
    // });
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera);
      // console.log({ current });
      if(CanvasState.mode === CanvasMode.Translating){
        //console.log("Translating");
        translateSelectedLayers(current);
      }
      else if (CanvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }
      setMyPresence({ cursor: current });
    },
    [camera, CanvasState, resizeSelectedLayer,translateSelectedLayers]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown=useCallback((
    e:React.PointerEvent
  )=>{
    const point=pointerEventToCanvasPoint(e,camera);

    if(CanvasState.mode===CanvasMode.Inserting){
      return;
    }

    setCanvasState({origin:point,mode:CanvasMode.Pressing});
  },[camera,CanvasState.mode,setCanvasState]);

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if(CanvasState.mode === CanvasMode.None || CanvasState.mode === CanvasMode.Pressing){
        unselectLayers(); 
        setCanvasState({
          mode:CanvasMode.None,
        })
      }
      else if (CanvasState.mode === CanvasMode.Inserting) {
        insertLayer(CanvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
      history.resume();
    },
    [camera, CanvasState, history, insertLayer,unselectLayers]
  );

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        CanvasState.mode === CanvasMode.Pencil ||
        CanvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }
      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);
      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, CanvasState.mode]
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};

    for (const user of selections) {
      const [connectionId, selection] = user;
      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }

    return layerIdsToColorSelection;
  }, [selections]);

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participants />
      <Toolbar
        canvasState={CanvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <g style={{ transform: `translate(${camera.x}px,${camera.y}px)` }}>
          {layerIds?.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
};
