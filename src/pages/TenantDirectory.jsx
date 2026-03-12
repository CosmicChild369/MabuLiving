import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Search, Plus, Pencil, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

export default function TenantDirectory() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: "", user_email: "", phone: "", unit_number: "",
    monthly_rent: "", lease_start: "", lease_end: "", status: "active"
  });
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const data = await base44.entities.TenantProfile.list("-created_date");
    setTenants(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ full_name: "", user_email: "", phone: "", unit_number: "", monthly_rent: "", lease_start: "", lease_end: "", status: "active" });
    setDialogOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      full_name: t.full_name || "", user_email: t.user_email || "", phone: t.phone || "",
      unit_number: t.unit_number || "", monthly_rent: t.monthly_rent || "",
      lease_start: t.lease_start || "", lease_end: t.lease_end || "", status: t.status || "active"
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, monthly_rent: Number(form.monthly_rent) || 0 };
    if (editing) {
      await base44.entities.TenantProfile.update(editing.id, data);
    } else {
      await base44.entities.TenantProfile.create(data);
    }
    setSaving(false);
    setDialogOpen(false);
    loadData();
  };

  const filtered = tenants.filter(t => {
    const matchSearch = !search ||
      t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.unit_number?.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || t.status === tab;
    return matchSearch && matchTab;
  });

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tenant Directory</h1>
          <p className="text-sm text-slate-500">{tenants.length} total tenants</p>
        </div>
        <Button onClick={openNew} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Tenant
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="former">Former</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No tenants found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(t => (
            <Card key={t.id} className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">
                      {t.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.full_name}</p>
                    <p className="text-xs text-slate-400">Unit {t.unit_number} · R{t.monthly_rent?.toLocaleString()}/mo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs">Unit Number</Label>
                <Input value={form.unit_number} onChange={e => setForm({...form, unit_number: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.user_email} onChange={e => setForm({...form, user_email: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monthly Rent (R)</Label>
                <Input type="number" value={form.monthly_rent} onChange={e => setForm({...form, monthly_rent: e.target.value})} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.full_name || !form.unit_number || saving}
              className="bg-amber-500 hover:bg-amber-600 text-white">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Update" : "Add Tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
