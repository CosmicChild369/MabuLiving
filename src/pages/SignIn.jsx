import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, ShieldCheck, User } from "lucide-react";

export default function SignIn() {
  const [role, setRole] = useState(null);

  const handleLogin = () => {
    base44.auth.redirectToLogin(role === "admin" ? createPageUrl("AdminDashboard") : createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to home</Link>
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mb-3"><span className="text-[#0f172a] font-black text-xl">M</span></div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        </div>
        {!role ? (
          <div className="space-y-3">
            <button onClick={() => setRole("tenant")} className="w-full flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-left"><div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-slate-300" /></div><div><p className="text-sm font-semibold text-white">Tenant</p></div></button>
            <button onClick={() => setRole("admin")} className="w-full flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-left"><div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-slate-300" /></div><div><p className="text-sm font-semibold text-white">Admin / Owner</p></div></button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-5">
            <Button onClick={handleLogin} className="w-full bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-bold"><LogIn className="w-4 h-4 mr-2" />Continue to Sign In</Button>
          </div>
        )}
      </div>
    </div>
  );
}
