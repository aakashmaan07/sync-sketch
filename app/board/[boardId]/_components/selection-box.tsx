"use client";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react/suspense";
import { memo } from "react";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBound: XYWH) => void;
}

const Handle_Width = 8;

export const SelectionBox = memo(
  ({ onResizeHandlePointerDown }: SelectionBoxProps) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
    );

    const bounds = useSelectionBounds();

    if (!bounds) {
      return null;
    }

    return (
      <>
        <rect
          className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
          style={{ transform: `translate(${bounds.x}px,${bounds.y}px)` }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />
        {isShowingHandles && (
          <>
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2}px,
                ${bounds.y - Handle_Width / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x + bounds.width / 2 - Handle_Width / 2}px,
                ${bounds.y - Handle_Width / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2 + bounds.width}px,
                ${bounds.y - Handle_Width / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2 + bounds.width}px,
                ${bounds.y + bounds.height - Handle_Width / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2 + bounds.width}px,
                ${bounds.y - Handle_Width / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2 + bounds.width / 2}px,
                ${bounds.y - Handle_Width / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2}px,
                ${bounds.y - Handle_Width / 2 + bounds.height}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${Handle_Width}px`,
                height: `${Handle_Width}px`,
                transform: `translate(${bounds.x - Handle_Width / 2}px,
                ${bounds.y - Handle_Width / 2 + bounds.height / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            />
          </>
        )}
      </>
    );
  }
);

SelectionBox.displayName = "SelectionBox";
