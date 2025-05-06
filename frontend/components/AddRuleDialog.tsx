"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export interface AddRuleFormData {
  type: 'port' | 'ip';
  action: 'allow' | 'deny';
  portProto: string;
  ipAddress: string;
  ipPortProto: string;
  portIpv4: boolean;
  portIpv6: boolean;
  comment: string;
}

interface AddRuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: AddRuleFormData) => void;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

export default function AddRuleDialog({
  isOpen,
  onOpenChange,
  onSave,
  isSubmitting,
  error,
  clearError,
}: AddRuleDialogProps) {
  const [type, setType] = useState<'port' | 'ip'>('port');
  const [action, setAction] = useState<'allow' | 'deny'>('allow');
  const [portProto, setPortProto] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [ipPortProto, setIpPortProto] = useState<string>('');
  const [portIpv4, setPortIpv4] = useState<boolean>(true);
  const [portIpv6, setPortIpv6] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');

  const handleTypeChange = (value: string) => {
    setType(value as 'port' | 'ip');
    clearError(); 
  };

  const handleActionChange = (value: string) => {
    setAction(value as 'allow' | 'deny');
    clearError();
  };

  const handleSaveClick = () => {
    clearError(); 
    onSave({
      type,
      action,
      portProto,
      ipAddress,
      ipPortProto,
      portIpv4,
      portIpv6,
      comment,
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        clearError();
    }
    onOpenChange(open);
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[35vw]">
        <DialogHeader>
          <DialogTitle>Add New UFW Rule</DialogTitle>
          <DialogDescription>Configure the details for the new firewall rule.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-type" className="text-right">Rule Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Select rule type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="port">Port/Protocol Based</SelectItem>
                <SelectItem value="ip">IP Address Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-action" className="text-right">Action</Label>
            <RadioGroup defaultValue="allow" className="col-span-3 flex space-x-4" value={action} onValueChange={handleActionChange}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="allow" id="r-allow" /><Label htmlFor="r-allow">Allow</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="deny" id="r-deny" /><Label htmlFor="r-deny">Deny</Label></div>
            </RadioGroup>
          </div>

          {type === 'port' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="port-proto" className="text-right">Port/Proto</Label>
                <Input id="port-proto" value={portProto} onChange={(e) => { setPortProto(e.target.value); clearError(); }} placeholder="e.g., 80/tcp, 443, 1000:2000/udp" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Apply To</Label>
                <div className="col-span-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ipv4" checked={portIpv4} onCheckedChange={(checked) => { setPortIpv4(!!checked); clearError(); }} />
                      <Label htmlFor="ipv4" className="font-normal">IPv4</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ipv6" checked={portIpv6} onCheckedChange={(checked) => { setPortIpv6(!!checked); clearError(); }} />
                      <Label htmlFor="ipv6" className="font-normal">IPv6</Label>
                    </div>
                </div>
              </div>
            </>
          )}

          {type === 'ip' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-address" className="text-right">IP Address</Label>
                <Input id="ip-address" value={ipAddress} onChange={(e) => { setIpAddress(e.target.value); clearError(); }} placeholder="e.g., 192.168.1.100, 10.0.0.0/24" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-port-proto" className="text-right">Port/Proto <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                <Input id="ip-port-proto" value={ipPortProto} onChange={(e) => { setIpPortProto(e.target.value); clearError(); }} placeholder="e.g., 80/tcp, 443 (allows all if blank)" className="col-span-3" />
              </div>
            </>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-comment" className="text-right">Comment <span className="text-xs text-muted-foreground">(Optional)</span></Label>
            <Input id="rule-comment" value={comment} onChange={(e) => { setComment(e.target.value); clearError(); }} placeholder="e.g., Allow SSH access" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          {error && <p className="text-sm text-destructive mr-auto">{error}</p>}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveClick} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
