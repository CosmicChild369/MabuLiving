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
import { Upload, Loader2, X, FileCheck } from "lucide-react";

const types = [
  { value: "maintenance", label: "Maintenance" },
  { value: "emergency", label: "Emergency" },
  { value: "abuse", label: "Abuse" },
  { value: "noise", label: "Noise" },
  { value: "safety", label: "Safety Hazard" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function ComplaintDialog({ open, onOpenChange, user, tenantProfile, onSuccess }) {
  const [form, setForm] = useState({
    type: "maintenance", title: "", description: "", priority: "medium"
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    setSubmitting(true);

    let attachments = [];
    for (const f of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      attachments.push(file_url);
    }

    await base44.entities.Complaint.create({
      ...form,
      tenant_email: user.email,
      tenant_name: user.full_name,
      unit_number: tenantProfile?.unit_number || "",
      attachments,
      status: "received",
    });

    setSubmitting(false);
    setForm({ type: "maintenance", title: "", description: "", priority: "medium" });
    setFiles([]);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a Complaint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Brief title..." />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Describe the issue in detail..." className="h-24" />
          </div>
          <div>
            <Label className="text-xs">Attachments (Photos/Videos)</Label>
            <div className="mt-1.5">
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-xs text-slate-600">
                      <FileCheck className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{f.name}</span>
                      <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => document.getElementById("complaint-files").click()}>
                <Upload className="w-3 h-3 mr-2" />
                Add Files
              </Button>
              <input id="complaint-files" type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileAdd} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.title || !form.description || submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {submitting ? "Submitting..." : "Submit Complaint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
