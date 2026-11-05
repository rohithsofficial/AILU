"use client";

import { useRef, useState } from "react";
import { toRupees } from "@/lib/money";

const input = "mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-ailu-cream placeholder:text-ailu-cream/40";

type DraftQuotation = {
  id: string; version: number; discountPaise: number; taxPaise: number; validUntil: Date | null; terms: string | null;
  items: { description: string; quantity: number; unitPricePaise: number }[];
};

export default function QuotationForm({ eventId, action, quotation }: { eventId: string; action: (formData: FormData) => Promise<void>; quotation?: DraftQuotation }) {
  const [rows, setRows] = useState(quotation?.items.length ? quotation.items.map((_, index) => index) : [0]);
  const nextRow = useRef(rows.length);

  return (
    <details className="mt-4 rounded-2xl border border-white/10 bg-[#111114] p-6">
      <summary className="cursor-pointer font-semibold text-ailu-yellow">{quotation ? `Edit draft quotation v${quotation.version}` : "Create a new quotation version"}</summary>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="eventId" value={eventId} />
        {quotation ? <input type="hidden" name="quotationId" value={quotation.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="block">Discount (INR)<input name="discount" type="number" min={0} step="0.01" className={input} defaultValue={quotation ? toRupees(quotation.discountPaise) : "0"} /></label>
          <label className="block">Tax (INR)<input name="tax" type="number" min={0} step="0.01" className={input} defaultValue={quotation ? toRupees(quotation.taxPaise) : "0"} /></label>
          <label className="block">Valid until<input name="validUntil" type="date" className={input} defaultValue={quotation?.validUntil?.toISOString().slice(0, 10) ?? ""} /></label>
        </div>
        <label className="block">Terms<textarea name="terms" rows={2} className={input} defaultValue={quotation?.terms ?? ""} /></label>
        <div className="rounded-lg border border-white/10 p-3">
          <h3 className="mb-2 font-semibold">Line items</h3>
          <div className="space-y-2">
            {rows.map((row, rowIndex) => (
              <div key={row} className="flex flex-wrap items-end gap-2">
                <label className="min-w-40 flex-1">Description<input type="text" name="itemDescription" required minLength={2} maxLength={300} defaultValue={quotation?.items[rowIndex]?.description ?? ""} className={input} /></label>
                <label>Quantity<input type="number" name="itemQuantity" min={1} max={10000} defaultValue={quotation?.items[rowIndex]?.quantity ?? 1} className={`${input} w-24`} /></label>
                <label>Unit price (INR)<input type="number" name="itemUnitPrice" min={0} step="0.01" defaultValue={quotation ? toRupees(quotation.items[rowIndex]?.unitPricePaise ?? 0) : ""} className={`${input} w-40`} /></label>
                {rows.length > 1 ? <button type="button" className="px-2 py-2 text-sm text-ailu-yellow underline" onClick={() => setRows((prev) => prev.filter((key) => key !== row))}>Remove</button> : null}
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 text-sm text-ailu-yellow underline" onClick={() => setRows((prev) => [...prev, nextRow.current++])}>+ Add line item</button>
        </div>
        <button className="rounded-full bg-ailu-yellow px-5 py-2 text-sm font-semibold text-ailu-black">{quotation ? "Save draft" : "Create quotation"}</button>
      </form>
    </details>
  );
}
