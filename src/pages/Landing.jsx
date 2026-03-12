import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Shield, Home, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center"><span className="text-[#0f172a] font-black text-sm">M</span></div>
          <div><span className="text-lg font-bold tracking-tight">Mabu</span></div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("TenantRegister")}><Button variant="ghost" className="text-slate-300 hover:text-white text-sm">Register</Button></Link>
          <Button onClick={() => window.location.href = createPageUrl("SignIn")} className="bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-semibold text-sm">Sign In</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-medium mb-8"><Shield className="w-3 h-3" />Secure · Simple · Smart</div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">Your home, <span className="text-amber-400">managed</span><br /> with care.</h1>
        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">Pay rent, report issues, receive announcements, and stay connected with your property manager — all in one place.</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link to={createPageUrl("TenantRegister")}><Button size="lg" className="bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-bold px-8">Register as Tenant <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          <Button size="lg" variant="outline" onClick={() => window.location.href = createPageUrl("SignIn")} className="border-white/20 text-white hover:bg-white/5 px-8">Admin Login</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[{ icon: CreditCard, title: "Easy Payments", desc: "Upload proof of rent in seconds" },{ icon: MessageSquare, title: "Stay Connected", desc: "Message management directly" },{ icon: Home, title: "Report Issues", desc: "Submit maintenance complaints easily" }].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left"><div className="w-9 h-9 bg-amber-400/15 rounded-xl flex items-center justify-center mb-3"><Icon className="w-4 h-4 text-amber-400" /></div><p className="font-semibold text-sm">{title}</p><p className="text-xs text-slate-400 mt-1">{desc}</p></div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-600">© {new Date().getFullYear()} Mabu Property Management</footer>
    </div>
  );
}
