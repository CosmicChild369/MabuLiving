import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";

const priorityStyles = {
  normal: "",
  important: "border-l-4 border-l-amber-400",
  urgent: "border-l-4 border-l-red-500",
};

const categoryBadges = {
  general: "bg-slate-100 text-slate-600",
  maintenance: "bg-blue-50 text-blue-700",
  payment: "bg-green-50 text-green-700",
  safety: "bg-red-50 text-red-700",
  event: "bg-purple-50 text-purple-700",
  policy: "bg-amber-50 text-amber-700",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Announcement.filter({ published: true }, "-created_date").then(data => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
        <p className="text-sm text-slate-500">Updates from your property management</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Check back later for updates" />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className={`p-5 border-0 shadow-sm ${priorityStyles[a.priority] || ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {a.priority === "urgent" && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <h3 className="text-sm font-semibold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{a.content}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={`text-[10px] ${categoryBadges[a.category] || categoryBadges.general}`}>
                      {a.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {a.author_name && `${a.author_name} · `}
                      {format(new Date(a.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
