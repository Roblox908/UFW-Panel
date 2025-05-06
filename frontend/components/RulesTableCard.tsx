"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";


export interface ParsedRule {
  number: string;
  to: string;
  action: string;
  from: string;
  details?: string;
  raw: string;
}

interface RulesTableCardProps {
  parsedRules: ParsedRule[];
  isSubmitting: boolean;
  onAddRuleClick: () => void;
  onDeleteRuleClick: (rule: ParsedRule) => void;
}

export default function RulesTableCard({
  parsedRules,
  isSubmitting,
  onAddRuleClick,
  onDeleteRuleClick,
}: RulesTableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rules</CardTitle>
          <CardDescription>Current firewall rules. Note: Parsing might be imperfect for complex rules.</CardDescription>
        </div>
        <Button size="sm" onClick={onAddRuleClick} disabled={isSubmitting}>
          Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        {parsedRules.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedRules.map((rule) => (
                <TableRow key={rule.number}>
                  <TableCell className="font-medium">{rule.number}</TableCell>
                  <TableCell>{rule.to}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${
                      rule.action.includes('ALLOW') ? 'text-green-600' :
                      rule.action.includes('DENY') ? 'text-red-600' : ''
                    }`}>
                      {rule.action}
                    </span>
                  </TableCell>
                  <TableCell>{rule.from}</TableCell>
                  <TableCell>{rule.details || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRuleClick(rule)}
                      disabled={isSubmitting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No rules defined or UFW is inactive.</p>
        )}
      </CardContent>
    </Card>
  );
}
