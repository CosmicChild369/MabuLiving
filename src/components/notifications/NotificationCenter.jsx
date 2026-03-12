import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, CreditCard, AlertTriangle, Megaphone, FileText, X, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const typeConfig = {
  payment_update: { icon: CreditCard, color: "text-green-600 bg-green-50" },
  complaint_response: { icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  announcement: { icon: Megaphone, color: "text-blue-600 bg-blue-50" },
  invoice: { icon: FileText, color: "text-purple-600 bg-purple-50" },
};

export default function NotificationCenter({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = async () => {
    if (!userEmail) return;
    const data = await base44.entities.Notification.filter(
      { recipient_email: userEmail },
      "-created_date",
      30
    );
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
    const unsub = base44.entities.Notification.subscribe((event) => {
      if (event.data?.recipient_email === userEmail) {
        loadNotifications();
      }
    });
    return () => unsub();
  }, [userEmail]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    const unreadOnes = notifications.filter(n => !n.read);
    await Promise.all(unreadOnes.map(n => base44.entities.Notification.update(n.id, { read: true })));
    loadNotifications();
  };

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.Notification.update(n.id, { read: true });
    loadNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
              {unread > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">{unread}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = typeConfig[n.type] || typeConfig.announcement;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left",
                      !n.read && "bg-amber-50/40"
                    )}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold text-slate-800", !n.read && "text-slate-900")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {format(new Date(n.created_date), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
