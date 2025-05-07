"use client";

import { useState, useEffect } from "react";
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
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

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
  const rulesPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(parsedRules.length / rulesPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [parsedRules, totalPages, currentPage]);

  const paginatedRules = parsedRules.slice(
    (currentPage - 1) * rulesPerPage,
    currentPage * rulesPerPage
  );

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
        {paginatedRules.length > 0 ? (
          <>
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
                {paginatedRules.map((rule) => (
                  <TableRow key={rule.number}>
                    <TableCell className="font-medium">{rule.number}</TableCell>
                    <TableCell>{rule.to}</TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          rule.action.includes("ALLOW")
                            ? "text-green-600"
                            : rule.action.includes("DENY")
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {rule.action}
                      </span>
                    </TableCell>
                    <TableCell>{rule.from}</TableCell>
                    <TableCell>{rule.details || "-"}</TableCell>
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
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1 || isSubmitting}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages || isSubmitting}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No rules defined or UFW is inactive.</p>
        )}
      </CardContent>
    </Card>
  );
}