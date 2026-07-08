"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    details?: string | null;
    confirmLabel?: string;
    isLoading?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
}

export default function DeleteConfirmDialog({
    open,
    title,
    description,
    details,
    confirmLabel = "Hapus",
    isLoading = false,
    onOpenChange,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-md shadow-slate-900/5 sm:max-w-md">
                <DialogHeader className="border-b border-slate-200/80 bg-slate-50/80 px-5 py-5 pr-14 text-left">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-danger-light text-danger ring-1 ring-danger/10">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <DialogTitle className="text-xl font-semibold tracking-normal text-slate-950">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-slate-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {details ? (
                    <div className="px-5 py-4">
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
                            <p className="line-clamp-3 whitespace-pre-line">{details}</p>
                        </div>
                    </div>
                ) : null}

                <DialogFooter className="border-t border-slate-200/80 bg-white px-5 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="m-0 h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        className="m-0 h-10 rounded-xl px-5 text-sm font-semibold"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
