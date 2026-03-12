import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Plus, Loader2, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AdminInvoices() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ tenant_id: "", month: months[new Date().getMonth()], year: String(new Date().getFullYear()), custom_amount: "" });

  const loadData = async () => {
    const [t, p] = await Promise.all([
      base44.entities.TenantProfile.filter({ status: "active" }),
      base44.entities.Payment.list("-created_date", 100),
    ]);
    setTenants(t);
    setPayments(p.filter(p => p.invoice_url));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerate = async () => {
    if (!form.tenant_id) return;
    setGenerating(true);
    const selectedTenant = tenants.find(t => t.id === form.tenant_id);
    await base44.entities.Payment.create({
      tenant_email: selectedTenant.user_email,
      tenant_name: selectedTenant.full_name,
      unit_number: selectedTenant.unit_number,
      amount: Number(form.custom_amount || selectedTenant.monthly_rent || 0),
      month_year: `${form.month} ${form.year}`,
      status: "pending",
      invoice_url: "",
      invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`,
    });
    setGenerating(false);
    setDialogOpen(false);
    loadData();
  };

  const filteredPayments = payments.filter(p => !search || p.tenant_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">Invoice Generator</h1><p className="text-sm text-slate-500">Generate and send rent invoices to tenants</p></div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="w-4 h-4 mr-2" /> Generate Invoice</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="pl-9" /></div>
      {filteredPayments.length === 0 ? <EmptyState icon={FileText} title="No invoices yet" /> : (
        <div className="space-y-2">{filteredPayments.map(p => <Card key={p.id} className="p-4 border-0 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{p.tenant_name} · {p.invoice_number}</p><div className="flex items-center gap-3"><StatusBadge status={p.status} /><a href={p.invoice_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1" /> View</Button></a></div></div></Card>)}</div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader><div className="space-y-4 py-2"><Select value={form.tenant_id} onValueChange={v => setForm({...form, tenant_id: v})}><SelectTrigger><SelectValue placeholder="Choose tenant..." /></SelectTrigger><SelectContent>{tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name} · Unit {t.unit_number}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleGenerate} disabled={!form.tenant_id || generating} className="bg-amber-500 hover:bg-amber-600 text-white">{generating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Generate</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
