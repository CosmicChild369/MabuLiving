import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Megaphone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";
import AnnouncementDialog from "@/components/admin/AnnouncementDialog";

export default function AdminAnnouncements() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const data = await base44.entities.Announcement.list("-created_date");
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.Announcement.delete(id);
    loadData();
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
          <p className="text-sm text-slate-500">Manage property announcements</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Create your first announcement" />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className="p-5 border-0 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {a.priority === "urgent" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{a.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{a.category}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{a.priority}</Badge>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(a.created_date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditing(a); setDialogOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        announcement={editing}
        onSuccess={loadData}
      />
    </div>
  );
}
