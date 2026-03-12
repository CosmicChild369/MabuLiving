import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileCheck } from "lucide-react";

const formTypes = [
  { value: "move_out", label: "Move Out" },
  { value: "lease_termination", label: "Lease Termination" },
  { value: "transfer", label: "Unit Transfer" },
  { value: "other", label: "Other" },
];

export default function ConcernFormDialog({ open, onOpenChange, user, tenantProfile, onSuccess }) {
  const [form, setForm] = useState({ form_type: "move_out", reason: "", move_out_date: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.reason) return;
    setSubmitting(true);

    let file_url = "";
    if (file) {
      const res = await base44.integrations.Core.UploadFile({ file });
      file_url = res.file_url;
    }

    await base44.entities.ConcernForm.create({
      ...form,
      tenant_email: user.email,
      tenant_name: user.full_name,
      unit_number: tenantProfile?.unit_number || "",
      file_url,
      status: "submitted",
    });

    setSubmitting(false);
    setForm({ form_type: "move_out", reason: "", move_out_date: "" });
    setFile(null);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Concern Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Form Type</Label>
            <Select value={form.form_type} onValueChange={v => setForm({...form, form_type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {formTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {(form.form_type === "move_out" || form.form_type === "lease_termination") && (
            <div>
              <Label className="text-xs">Move-out / Termination Date</Label>
              <Input type="date" value={form.move_out_date} onChange={e => setForm({...form, move_out_date: e.target.value})} />
            </div>
          )}
          <div>
            <Label className="text-xs">Reason</Label>
            <Textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
              placeholder="Please describe your reason..." className="h-24" />
          </div>
          <div>
            <Label className="text-xs">Signed Form (optional)</Label>
            <div className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById("concern-file").click()}>
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Upload signed form</p>
                </>
              )}
              <input id="concern-file" type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.reason || submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {submitting ? "Submitting..." : "Submit Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
