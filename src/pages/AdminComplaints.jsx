import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ComplaintActionDialog from "@/components/admin/ComplaintActionDialog";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    const data = await base44.entities.Complaint.list("-created_date");
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = complaints.filter(c => {
    const matchSearch = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenant_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Complaint Management</h1>
        <p className="text-sm text-slate-500">Track and resolve tenant complaints</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No complaints found" />
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id}
              className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelected(c)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.priority === "critical" ? "bg-red-50" : c.priority === "high" ? "bg-orange-50" : "bg-blue-50"
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      c.priority === "critical" ? "text-red-600" : c.priority === "high" ? "text-orange-600" : "text-blue-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-400">
                      {c.tenant_name} · Unit {c.unit_number} · {format(new Date(c.created_date), "MMM d")}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.type}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{c.priority}</Badge>
                    </div>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <ComplaintActionDialog
          complaint={selected}
          open={!!selected}
          onOpenChange={() => setSelected(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
