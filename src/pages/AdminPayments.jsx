import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import PaymentActionDialog from "@/components/admin/PaymentActionDialog";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    const data = await base44.entities.Payment.list("-created_date");
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      p.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.unit_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Payment Management</h1>
        <p className="text-sm text-slate-500">Review and verify tenant payments</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by tenant or unit..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments found" />
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <Card key={p.id}
              className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{p.tenant_name || p.tenant_email}</p>
                    <p className="text-xs text-slate-400">
                      Unit {p.unit_number} · {p.month_year} · R{p.amount?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 hidden sm:block">
                    {format(new Date(p.created_date), "MMM d")}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <PaymentActionDialog
          payment={selected}
          open={!!selected}
          onOpenChange={() => setSelected(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
