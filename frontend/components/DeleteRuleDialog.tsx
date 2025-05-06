"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { ParsedRule } from './RulesTableCard'; 

interface DeleteRuleDialogProps {
  ruleToDelete: ParsedRule | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (ruleNumber: string) => void;
  isSubmitting: boolean;
}

export default function DeleteRuleDialog({
  ruleToDelete,
  onOpenChange,
  onConfirmDelete,
  isSubmitting,
}: DeleteRuleDialogProps) {
  const isOpen = !!ruleToDelete; 

  const handleConfirm = () => {
    if (ruleToDelete) {
      onConfirmDelete(ruleToDelete.number);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete UFW rule number{' '}
            <strong>[{ruleToDelete?.number}]</strong>.
          </AlertDialogDescription>
          {ruleToDelete && (
            <div className="my-4 space-y-1 rounded-md border bg-muted p-3 text-sm">
              <p><strong>Number:</strong> {ruleToDelete.number}</p>
              <p><strong>To:</strong> {ruleToDelete.to}</p>
              <p><strong>Action:</strong> {ruleToDelete.action}</p>
              <p><strong>From:</strong> {ruleToDelete.from}</p>
              {ruleToDelete.details && <p><strong>Details:</strong> {ruleToDelete.details}</p>}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete Rule
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
