import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import ConcernFormDialog from "@/components/concerns/ConcernFormDialog";

export default function ConcernForms() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const [f, profiles] = await Promise.all([
      base44.entities.ConcernForm.filter({ tenant_email: me.email }, "-created_date"),
      base44.entities.TenantProfile.filter({ user_email: me.email }),
    ]);
    setForms(f);
    setProfile(profiles[0] || null);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Concern Forms</h1>
          <p className="text-sm text-slate-500">Submit and track move-out or transfer forms</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white"><Plus className="w-4 h-4 mr-2" />New Form</Button>
      </div>

      {forms.length === 0 ? <EmptyState icon={FileText} title="No concern forms" /> : (
        <div className="space-y-3">
          {forms.map(f => (
            <Card key={f.id} className="p-4 border-0 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{f.form_type?.replace(/_/g, " ")}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{f.reason}</p>
                    <span className="text-[10px] text-slate-400">Submitted: {format(new Date(f.created_date), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={f.status} />{f.file_url && <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-600"><ExternalLink className="w-4 h-4" /></a>}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConcernFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={user} tenantProfile={profile} onSuccess={loadData} />
    </div>
  );
}
