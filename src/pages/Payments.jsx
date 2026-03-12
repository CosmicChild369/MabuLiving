import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import PaymentUploadDialog from "@/components/payments/PaymentUploadDialog";

export default function Payments() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [pays, profiles] = await Promise.all([
      base44.entities.Payment.filter({ tenant_email: me.email }, "-created_date"),
      base44.entities.TenantProfile.filter({ user_email: me.email }),
    ]);
    setPayments(pays);
    setProfile(profiles[0] || null);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">My Payments</h1><p className="text-sm text-slate-500">Upload and track your rent payments</p></div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="w-4 h-4 mr-2" />Upload Proof</Button>
      </div>
      {payments.length === 0 ? <EmptyState icon={CreditCard} title="No payments yet" /> : (
        <div className="space-y-3">{payments.map(p => <Card key={p.id} className="p-4 border-0 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm font-semibold text-slate-900">{p.month_year}</p><p className="text-xs text-slate-400">R{p.amount?.toLocaleString()} · {format(new Date(p.created_date), "MMM d, yyyy")}</p></div></div><div className="flex items-center gap-3"><StatusBadge status={p.status} />{p.proof_file_url && <a href={p.proof_file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-600"><ExternalLink className="w-4 h-4" /></a>}</div></div></Card>)}</div>
      )}
      <PaymentUploadDialog open={dialogOpen} onOpenChange={setDialogOpen} user={user} tenantProfile={profile} onSuccess={loadData} />
    </div>
  );
}
