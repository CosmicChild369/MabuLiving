import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Building2, Loader2, LogIn } from "lucide-react";

export default function TenantRegister() {
  const [step, setStep] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [otpRecord, setOtpRecord] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [validating, setValidating] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const validateOTP = async () => {
    if (!otpCode.trim()) return;
    setValidating(true);
    setOtpError("");
    const results = await base44.entities.RegistrationOTP.filter({ code: otpCode.trim().toUpperCase() });
    const otp = results[0];
    if (!otp) { setOtpError("Invalid OTP code."); setValidating(false); return; }
    setOtpRecord(otp);
    setValidating(false);
    setStep(1);
  };

  const handleRegister = async () => {
    if (!form.full_name || !form.email) return;
    setSaving(true);
    await base44.entities.TenantProfile.create({ full_name: form.full_name, phone: form.phone, user_email: form.email, unit_number: otpRecord.unit_number, building_name: otpRecord.building_name, monthly_rent: otpRecord.monthly_rent || 0, status: "pending" });
    await base44.entities.RegistrationOTP.update(otpRecord.id, { status: "used", assigned_to_email: form.email, assigned_to_name: form.full_name });
    setSaving(false);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8"><div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center mb-3"><span className="text-[#0f172a] font-black text-xl">M</span></div><h1 className="text-2xl font-bold text-white">Tenant Registration</h1></div>

        {step === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="text-center"><div className="w-12 h-12 bg-amber-400/15 rounded-2xl flex items-center justify-center mx-auto mb-3"><KeyRound className="w-6 h-6 text-amber-400" /></div><h2 className="text-white font-semibold">Enter Your OTP</h2></div>
            <div><Label className="text-xs text-slate-300">Registration Code</Label><Input value={otpCode} onChange={e => { setOtpCode(e.target.value.toUpperCase()); setOtpError(""); }} className="mt-1.5 bg-white/10 border-white/20 text-white" />{otpError && <p className="mt-2 text-red-400 text-xs">{otpError}</p>}</div>
            <Button onClick={validateOTP} disabled={!otpCode.trim() || validating} className="w-full bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-bold">{validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{validating ? "Validating..." : "Validate Code"}</Button>
            <Link to={createPageUrl("SignIn")} className="text-amber-400 text-xs">Already registered? Sign in</Link>
          </div>
        )}

        {step === 1 && otpRecord && (
          <div className="space-y-4">
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 flex items-center gap-4"><Building2 className="w-5 h-5 text-amber-400" /><p className="text-white font-bold">{otpRecord.building_name || "Property"} · Unit {otpRecord.unit_number}</p></div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div><Label className="text-xs text-slate-300">Full Name *</Label><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1.5 bg-white/10 border-white/20 text-white" /></div>
              <div><Label className="text-xs text-slate-300">Email Address *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1.5 bg-white/10 border-white/20 text-white" /></div>
              <div className="flex gap-3 pt-2"><Button variant="outline" onClick={() => setStep(0)} className="border-white/20 text-slate-300"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button><Button onClick={handleRegister} disabled={!form.full_name || !form.email || saving} className="flex-1 bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-bold">{saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Complete Registration {!saving && <ArrowRight className="w-4 h-4 ml-2" />}</Button></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-5"><CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" /><h2 className="text-xl font-bold text-white">You're registered!</h2><Button onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))} className="w-full bg-amber-400 hover:bg-amber-500 text-[#0f172a] font-bold"><LogIn className="w-4 h-4 mr-2" /> Sign In Now</Button></div>
        )}
      </div>
    </div>
  );
}
