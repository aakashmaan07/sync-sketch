"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useConvexMutation from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConfrimModal } from "./confirm-modal";
import { Button } from "@/components/ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps {
  children: React.ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: Id<"boards">;
  title: string;
}

export const Actions = ({
  children,
  side,
  sideOffset,
  id,
  title,
}: ActionProps) => {
  const { onOpen } = useRenameModal();
  const { mutate, pending } = useConvexMutation(api.board.remove);

  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => toast.success("Link Copied"))
      .catch(() => toast.error("Failed to copy Link"));
  };

  const onDelete = () => {
    mutate({ id })
      .then(() => toast.success("Board Deleted"))
      .catch(() => toast.error("Failed to delete board "));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        side={side}
        sideOffset={sideOffset}
        className="w-60"
      >
        <DropdownMenuItem onClick={onCopyLink} className="p-3 cursor-pointer">
          <Link2 className="h-4 w-4 mr-2 " />
          Copy Board Link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpen(id, title)}
          className="p-3 cursor-pointer"
        >
          <Pencil className="h-4 w-4 mr-2 " />
          Rename
        </DropdownMenuItem>
        <ConfrimModal
          header="Delete Board?"
          description="This will delete board and all of its content"
          disabled={pending}
          onConfirm={onDelete}
        >
          <Button
            // onClick={onDelete}
            className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
            variant={"ghost"}
          >
            <Trash2 className="h-4 w-4 mr-2 " />
            Delete
          </Button>
        </ConfrimModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
