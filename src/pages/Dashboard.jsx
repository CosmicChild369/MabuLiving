import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CreditCard, AlertTriangle, Megaphone, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [pay, comp, ann] = await Promise.all([
        base44.entities.Payment.filter({ tenant_email: me.email }, "-created_date", 5),
        base44.entities.Complaint.filter({ tenant_email: me.email }, "-created_date", 5),
        base44.entities.Announcement.filter({ published: true }, "-created_date", 3),
      ]);
      setPayments(pay);
      setComplaints(comp);
      setAnnouncements(ann);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const openComplaints = complaints.filter(c => c.status !== "resolved" && c.status !== "closed").length;

  return (
    <div className="space-y-8 max-w-5xl">
      <div><h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name?.split(" ")[0] || "Tenant"}</h1><p className="text-sm text-slate-500 mt-1">Here's what's happening with your tenancy</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Payments" value={pendingPayments} icon={CreditCard} color="amber" />
        <StatCard title="Open Complaints" value={openComplaints} icon={AlertTriangle} color="red" />
        <StatCard title="Announcements" value={announcements.length} icon={Megaphone} color="blue" />
      </div>

      <Card className="p-0 border-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Recent Payments</h2><Link to={createPageUrl("Payments")}><Button variant="ghost" size="sm" className="text-xs text-slate-500">View all <ArrowRight className="w-3 h-3 ml-1" /></Button></Link></div>
        <div className="divide-y divide-slate-50">{payments.slice(0, 3).map(p => <div key={p.id} className="flex items-center justify-between px-5 py-3.5"><div><p className="text-sm font-medium text-slate-800">{p.month_year}</p><p className="text-xs text-slate-400">R{p.amount?.toLocaleString()}</p></div><StatusBadge status={p.status} /></div>)}</div>
      </Card>

      <Card className="p-0 border-0 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Latest Announcements</h2><Link to={createPageUrl("Announcements")}><Button variant="ghost" size="sm" className="text-xs text-slate-500">View all <ArrowRight className="w-3 h-3 ml-1" /></Button></Link></div>
        <div className="divide-y divide-slate-50">{announcements.map(a => <div key={a.id} className="px-5 py-4"><p className="text-sm font-medium text-slate-800">{a.title}</p><p className="text-xs text-slate-400">{format(new Date(a.created_date), "MMM d, yyyy")}</p></div>)}</div>
      </Card>
    </div>
  );
}
