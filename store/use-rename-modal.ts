import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";

function createBoardId(id: string): Id<"boards"> {
    return id as Id<"boards">;
}

const defaultValues = { id: "" as Id<"boards">, title: "" };

interface IRenameModal {
    isOpen: boolean;
    initialValues: typeof defaultValues;
    onOpen: (id: string, title: string) => void;
    onClose: () => void;
};

export const useRenameModal = create<IRenameModal>((set) => ({
    isOpen: false,
    onOpen: (id, title) => set({
        isOpen: true,
        initialValues: { id: createBoardId(id), title },
    }),
    onClose: () => set({
        isOpen: false,
        initialValues: defaultValues,
    }),
    initialValues: defaultValues,
}));