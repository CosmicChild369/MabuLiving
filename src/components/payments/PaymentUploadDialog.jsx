import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileCheck } from "lucide-react";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

export default function PaymentUploadDialog({ open, onOpenChange, user, tenantProfile, onSuccess }) {
  const [amount, setAmount] = useState(tenantProfile?.monthly_rent || "");
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [year, setYear] = useState(String(currentYear));
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file || !amount) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Payment.create({
      tenant_email: user.email,
      tenant_name: user.full_name,
      unit_number: tenantProfile?.unit_number || "",
      amount: Number(amount),
      month_year: `${month} ${year}`,
      payment_date: new Date().toISOString().split("T")[0],
      due_date: new Date().toISOString().split("T")[0],
      proof_file_url: file_url,
      status: "pending",
    });
    setUploading(false);
    setFile(null);
    setAmount(tenantProfile?.monthly_rent || "");
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Payment Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Amount (R)</Label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label className="text-xs">Proof of Payment (Image/PDF)</Label>
            <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById("payment-file").click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click to upload</p>
                  <p className="text-xs text-slate-400">JPG, PNG or PDF</p>
                </>
              )}
              <input
                id="payment-file"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !amount || uploading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {uploading ? "Uploading..." : "Submit Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
