import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Users, ArrowRight, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Payment.list("-created_date", 50),
      base44.entities.Complaint.list("-created_date", 50),
      base44.entities.TenantProfile.filter({ status: "active" }),
    ]).then(([p, c, t]) => {
      setPayments(p);
      setComplaints(c);
      setTenants(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const overduePayments = payments.filter(p => p.status === "overdue").length;
  const openComplaints = complaints.filter(c => c.status === "received" || c.status === "in_progress").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of property management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Tenants" value={tenants.length} icon={Users} color="blue" />
        <StatCard title="Pending Payments" value={pendingPayments} icon={Clock} color="amber" />
        <StatCard title="Overdue" value={overduePayments} icon={XCircle} color="red" />
        <StatCard title="Open Complaints" value={openComplaints} icon={AlertTriangle} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0 border-0 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Payments</h2>
            <Link to={createPageUrl("AdminPayments")}>
              <Button variant="ghost" size="sm" className="text-xs"><ArrowRight className="w-3 h-3" /></Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.tenant_name || p.tenant_email}</p>
                  <p className="text-xs text-slate-400">Unit {p.unit_number} · {p.month_year}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">R{p.amount?.toLocaleString()}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 border-0 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Complaints</h2>
            <Link to={createPageUrl("AdminComplaints")}>
              <Button variant="ghost" size="sm" className="text-xs"><ArrowRight className="w-3 h-3" /></Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {complaints.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.tenant_name} · Unit {c.unit_number}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
