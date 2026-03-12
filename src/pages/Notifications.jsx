import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, CreditCard, AlertTriangle, Megaphone, FileText, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";

const typeConfig = {
  payment_update: { icon: CreditCard, color: "text-green-600 bg-green-50" },
  complaint_response: { icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  announcement: { icon: Megaphone, color: "text-blue-600 bg-blue-50" },
  invoice: { icon: FileText, color: "text-purple-600 bg-purple-50" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const me = await base44.auth.me();
    const data = await base44.entities.Notification.filter({ recipient_email: me.email }, "-created_date", 50);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    loadData();
  };

  if (loading) return <div className="animate-pulse space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}</div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">Notifications</h1><p className="text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p></div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead} className="text-amber-600 border-amber-200"><CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Mark all read</Button>}
      </div>
      {notifications.length === 0 ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="space-y-2">{notifications.map(n => {const cfg = typeConfig[n.type] || typeConfig.announcement; const Icon = cfg.icon; return <Card key={n.id} className={cn("p-4 border-0 shadow-sm transition-all", !n.read && "border-l-4 border-l-amber-400 bg-amber-50/30")}><div className="flex items-start gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}><Icon className="w-4.5 h-4.5" /></div><div className="flex-1"><p className="text-sm font-semibold text-slate-800">{n.title}</p><p className="text-xs text-slate-500 mt-0.5">{n.message}</p><p className="text-[10px] text-slate-400 mt-1.5">{format(new Date(n.created_date), "EEEE, MMM d 'at' h:mm a")}</p></div></div></Card>;})}</div>
      )}
    </div>
  );
}
