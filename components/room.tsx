"use client";

import { ReactNode } from "react";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";

interface RoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
}

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  return (
    // publicApiKey="pk_dev_O2y11iQnod5yvraEtJciR1quhIbGV6jFTi0NmttEuONjbo1FLmyHcqUZUbiiJ413"
    <LiveblocksProvider authEndpoint={"/api/liveblocks-auth"}>
      <RoomProvider id={roomId} initialPresence={{}}>
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
