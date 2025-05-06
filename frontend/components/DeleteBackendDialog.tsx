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
import { BackendConfig } from "@/lib/types"; 

interface DeleteBackendDialogProps {
  backendToDelete: BackendConfig | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: (backend: BackendConfig) => void; 
}

export default function DeleteBackendDialog({
  backendToDelete,
  onOpenChange,
  onConfirmDelete,
}: DeleteBackendDialogProps) {

  const handleConfirm = () => {
    if (backendToDelete) {
      onConfirmDelete(backendToDelete);
    }
    onOpenChange(false); 
  };

  return (
    <AlertDialog open={!!backendToDelete} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the backend configuration for:
            <br />
            <strong>Name:</strong> {backendToDelete?.name}
            <br />
            <strong>URL:</strong> {backendToDelete?.url}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Yes, remove backend
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
