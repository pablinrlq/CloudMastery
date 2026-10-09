"use client";

import { PrinterIcon } from "@/components/ui-icons";

export function PrintButton({ className = "ws-btn ws-btn-secondary" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <PrinterIcon className="h-4 w-4" />
      Imprimir / salvar PDF
    </button>
  );
}
