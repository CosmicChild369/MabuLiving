import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, KeyRound, Copy, CheckCheck, Trash2, Search, RefreshCw, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

function generateCode(unitNumber, building) {
  const prefix = building ? building.toUpperCase().replace(/\s+/g, "").slice(0, 4) : "MABU";
  const unitPart = unitNumber.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${unitPart}-${rand}`;
}

export default function AdminOTPs() {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unit_number: "", building_name: "", monthly_rent: "", notes: "", expires_at: "" });
  const [generatedCode, setGeneratedCode] = useState("");

  const loadData = async () => {
    const data = await base44.entities.RegistrationOTP.list("-created_date");
    setOtps(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openNew = () => {
    setForm({ unit_number: "", building_name: "", monthly_rent: "", notes: "", expires_at: "" });
    setGeneratedCode("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!generatedCode || !form.unit_number) return;
    setSaving(true);
    await base44.entities.RegistrationOTP.create({
      code: generatedCode,
      unit_number: form.unit_number.toUpperCase(),
      building_name: form.building_name,
      monthly_rent: Number(form.monthly_rent) || 0,
      notes: form.notes,
      expires_at: form.expires_at || null,
      status: "active",
    });
    setSaving(false);
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.RegistrationOTP.delete(id);
    loadData();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = otps.filter(o => !search || o.code?.toLowerCase().includes(search.toLowerCase()) || o.unit_number?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registration OTPs</h1>
          <p className="text-sm text-slate-500">Generate unique codes for new tenants</p>
        </div>
        <Button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="w-4 h-4 mr-2" /> Generate OTP</Button>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9" /></div>

      {filtered.length === 0 ? <EmptyState icon={KeyRound} title="No OTPs yet" /> : (
        <div className="space-y-2">
          {filtered.map(otp => (
            <Card key={otp.id} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><code className="text-sm font-bold tracking-widest text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{otp.code}</code>
                    <button onClick={() => handleCopy(otp.code)}>{copied === otp.code ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button>
                  </div>
                  <span className="text-xs text-slate-500"><Building2 className="w-3 h-3 inline mr-0.5" />{otp.building_name || "—"} · Unit {otp.unit_number}</span>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={otp.status} /><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(otp.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button></div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Generate Registration OTP</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Unit Number *</Label><Input value={form.unit_number} onChange={e => { setForm({...form, unit_number: e.target.value}); setGeneratedCode(""); }} /></div>
              <div><Label className="text-xs">Building Name</Label><Input value={form.building_name} onChange={e => { setForm({...form, building_name: e.target.value}); setGeneratedCode(""); }} /></div>
            </div>
            <div className="flex gap-2"><div className="flex-1 px-3 py-2.5 rounded-xl border-2 text-center font-mono font-bold tracking-widest text-lg">{generatedCode || "Click generate →"}</div><Button variant="outline" onClick={() => setGeneratedCode(generateCode(form.unit_number, form.building_name))} disabled={!form.unit_number}><RefreshCw className="w-4 h-4" /></Button></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!generatedCode || !form.unit_number || saving} className="bg-amber-500 hover:bg-amber-600 text-white">{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save OTP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
