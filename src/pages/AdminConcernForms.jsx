import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Search, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

export default function AdminConcernForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    const data = await base44.entities.ConcernForm.list("-created_date");
    setForms(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setUpdating(true);
    await base44.entities.ConcernForm.update(selected.id, { status, admin_notes: notes });
    setUpdating(false);
    setSelected(null);
    loadData();
  };

  const filtered = forms.filter(f =>
    !search ||
    f.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.unit_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Concern Forms</h1>
        <p className="text-sm text-slate-500">Review move-out and transfer requests</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No concern forms" />
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <Card key={f.id}
              className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelected(f); setStatus(f.status); setNotes(f.admin_notes || ""); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{f.tenant_name}</p>
                    <p className="text-xs text-slate-400">
                      Unit {f.unit_number} · {f.form_type?.replace(/_/g, " ")} · {format(new Date(f.created_date), "MMM d")}
                    </p>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Concern Form</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Tenant</p>
                  <p className="font-medium">{selected.tenant_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-medium capitalize">{selected.form_type?.replace(/_/g, " ")}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reason</p>
                <p className="text-sm mt-1">{selected.reason}</p>
              </div>
              {selected.file_url && (
                <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-amber-600">
                  <ExternalLink className="w-4 h-4" /> View Signed Form
                </a>
              )}
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Admin Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="h-20" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updating} className="bg-amber-500 hover:bg-amber-600 text-white">
              {updating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
