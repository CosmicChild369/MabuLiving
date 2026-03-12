import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ComplaintDialog from "@/components/complaints/ComplaintDialog";

const typeIcons = {
  emergency: "bg-red-50 text-red-600",
  maintenance: "bg-blue-50 text-blue-600",
  abuse: "bg-purple-50 text-purple-600",
  noise: "bg-orange-50 text-orange-600",
  safety: "bg-yellow-50 text-yellow-700",
  other: "bg-slate-100 text-slate-600",
};

export default function Complaints() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [comps, profiles] = await Promise.all([
      base44.entities.Complaint.filter({ tenant_email: me.email }, "-created_date"),
      base44.entities.TenantProfile.filter({ user_email: me.email }),
    ]);
    setComplaints(comps);
    setProfile(profiles[0] || null);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Complaints</h1>
          <p className="text-sm text-slate-500">Report maintenance issues, emergencies & more</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="w-4 h-4 mr-2" />New Complaint</Button>
      </div>

      {complaints.length === 0 ? <EmptyState icon={AlertTriangle} title="No complaints" /> : (
        <div className="space-y-3">
          {complaints.map(c => (
            <Card key={c.id} className="p-4 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeIcons[c.type] || typeIcons.other}`}><AlertTriangle className="w-4.5 h-4.5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.type}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{c.priority}</Badge>
                      <span className="text-[10px] text-slate-400">{format(new Date(c.created_date), "MMM d, yyyy")}</span>
                    </div>
                    {c.attachments?.length > 0 && (<div className="flex items-center gap-1 mt-2 text-xs text-slate-400"><ImageIcon className="w-3 h-3" />{c.attachments.length} attachment{c.attachments.length > 1 ? "s" : ""}</div>)}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ComplaintDialog open={dialogOpen} onOpenChange={setDialogOpen} user={user} tenantProfile={profile} onSuccess={loadData} />
    </div>
  );
}
