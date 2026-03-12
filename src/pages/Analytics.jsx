import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, TrendingUp, CreditCard, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatCard from "@/components/shared/StatCard";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Payment.list("-created_date", 200),
      base44.entities.Complaint.list("-created_date", 200),
      base44.entities.TenantProfile.list(),
    ]).then(([p, c, t]) => {
      setPayments(p);
      setComplaints(c);
      setTenants(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const totalRevenue = payments.filter(p => p.status === "verified").reduce((s, p) => s + (p.amount || 0), 0);
  const pendingRevenue = payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
  const avgResolution = (() => {
    const resolved = complaints.filter(c => c.resolved_date && c.created_date);
    if (!resolved.length) return 0;
    const total = resolved.reduce((sum, c) => {
      return sum + (new Date(c.resolved_date) - new Date(c.created_date)) / (1000 * 60 * 60 * 24);
    }, 0);
    return Math.round(total / resolved.length);
  })();

  const paymentStatusData = ["pending", "verified", "rejected", "overdue"].map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: payments.filter(p => p.status === status).length,
  })).filter(d => d.value > 0);

  const complaintTypeData = ["maintenance", "emergency", "abuse", "noise", "safety", "other"].map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: complaints.filter(c => c.type === type).length,
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Property performance insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Verified Revenue" value={`R${totalRevenue.toLocaleString()}`} icon={CreditCard} color="green" />
        <StatCard title="Pending Revenue" value={`R${pendingRevenue.toLocaleString()}`} icon={TrendingUp} color="amber" />
        <StatCard title="Total Complaints" value={complaints.length} icon={AlertTriangle} color="red" />
        <StatCard title="Avg Resolution" value={`${avgResolution} days`} icon={BarChart3} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Payment Status</CardTitle></CardHeader>
          <CardContent>
            {paymentStatusData.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No data yet</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {paymentStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Complaint Types</CardTitle></CardHeader>
          <CardContent>
            {complaintTypeData.length === 0 ? <p className="text-sm text-slate-400 py-8 text-center">No data yet</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={complaintTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
