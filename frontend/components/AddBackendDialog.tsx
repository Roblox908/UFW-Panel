"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface AddBackendFormData {
  name: string;
  url: string;
  apiKey: string; 
}

interface AddBackendDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: AddBackendFormData) => void; 
}

export default function AddBackendDialog({ isOpen, onOpenChange, onSave }: AddBackendDialogProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState(''); // State for API Key
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setUrl('');
      setApiKey(''); // Reset API key field
      setError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    setError(null);
    if (!name.trim()) {
      setError("Backend name cannot be empty.");
      return;
    }
    if (!url.trim()) {
      setError("Backend URL cannot be empty.");
      return;
    }
    try {
      new URL(url.trim());
    } catch (_) {
      setError("Invalid URL format. Please include http:// or https://");
      return;
    }
    // API Key is now mandatory
    if (!apiKey.trim()) {
      setError("API Key cannot be empty.");
      return;
    }

    onSave({ name: name.trim(), url: url.trim(), apiKey: apiKey.trim() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Backend</DialogTitle>
          <DialogDescription>
            Enter a name, the full URL, and the API Key for the backend server.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backend-name" className="text-right">
              Name
            </Label>
            <Input
              id="backend-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Production Server"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backend-url" className="text-right">
              URL
            </Label>
            <Input
              id="backend-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3"
              placeholder="e.g., http://192.168.1.100:8080"
              type="url"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="backend-apikey" className="text-right">
              API Key
            </Label>
            <Input
              id="backend-apikey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter backend specific API Key"
              type="password" 
              required
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Backend</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
