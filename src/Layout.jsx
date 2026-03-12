import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home, CreditCard, AlertTriangle, Megaphone, FileText, MessageSquare,
  Users, BarChart3, Menu, X, LogOut, ChevronRight, User, KeyRound, Receipt, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const tenantNav = [
  { name: "Dashboard", icon: Home, page: "Dashboard" },
  { name: "Payments", icon: CreditCard, page: "Payments" },
  { name: "Complaints", icon: AlertTriangle, page: "Complaints" },
  { name: "Announcements", icon: Megaphone, page: "Announcements" },
  { name: "Messages", icon: MessageSquare, page: "Messages" },
  { name: "Concern Forms", icon: FileText, page: "ConcernForms" },
  { name: "Notifications", icon: Bell, page: "Notifications" },
];

const adminNav = [
  { name: "Dashboard", icon: Home, page: "AdminDashboard" },
  { name: "Payments", icon: CreditCard, page: "AdminPayments" },
  { name: "Complaints", icon: AlertTriangle, page: "AdminComplaints" },
  { name: "Announcements", icon: Megaphone, page: "AdminAnnouncements" },
  { name: "Messages", icon: MessageSquare, page: "Messages" },
  { name: "Concern Forms", icon: FileText, page: "AdminConcernForms" },
  { name: "Tenants", icon: Users, page: "TenantDirectory" },
  { name: "OTP Codes", icon: KeyRound, page: "AdminOTPs" },
  { name: "Invoices", icon: Receipt, page: "AdminInvoices" },
  { name: "Analytics", icon: BarChart3, page: "Analytics" },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNav : tenantNav;

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Landing"));
  };

  const noLayoutPages = ["Landing", "SignIn", "TenantRegister"];
  if (noLayoutPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl" />
          <div className="h-2 w-24 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <style>{`
        :root {
          --mabu-navy: #0f172a;
          --mabu-amber: #f59e0b;
          --mabu-amber-light: #fef3c7;
        }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center">
              <span className="text-[#0f172a] font-black text-sm">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Mabu</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Tenant Portal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-amber-400/15 text-amber-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.name}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-slate-900">
              {navItems.find(n => n.page === currentPageName)?.name || currentPageName}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {!isAdmin && <NotificationCenter userEmail={user?.email} />}
            <Badge variant="outline" className={cn(
              "text-xs font-medium",
              isAdmin ? "border-amber-300 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-600"
            )}>
              {isAdmin ? "Admin" : "Tenant"}
            </Badge>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
