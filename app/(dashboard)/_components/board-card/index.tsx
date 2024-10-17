"use client";

import Image from "next/image";
import Link from "next/link";
import { Overlay } from "./overlay";
import {formatDistanceToNow} from "date-fns";
import { useAuth } from "@clerk/nextjs";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavorite: boolean;
}

export const BoardCard = ({
  id,
  authorId,
  authorName,
  title,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) => {
    const {userId}=useAuth();
    const authorLabel=userId
  return (
    <Link href={`/board/${id}`}>
      <div className="group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden">
        <div className="relative flex-1 bg-amber-50">
          <Image src={imageUrl} alt={title} fill className="object-fit p-8" />
          <Overlay/>
        </div>
      </div>
    </Link>
  );
};