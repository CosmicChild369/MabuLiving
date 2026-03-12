import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ExternalLink, Loader2 } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { createNotification } from "@/components/shared/notificationHelpers";

export default function PaymentActionDialog({ payment, open, onOpenChange, onSuccess }) {
  const [notes, setNotes] = useState(payment?.admin_notes || "");
  const [updating, setUpdating] = useState(false);

  const handleAction = async (status) => {
    setUpdating(true);
    await base44.entities.Payment.update(payment.id, { status, admin_notes: notes });
    await createNotification({
      recipient_email: payment.tenant_email,
      type: "payment_update",
      title: `Payment ${status === "verified" ? "Verified" : "Rejected"}`,
      message: `Your ${payment.month_year} rent payment of R${payment.amount?.toLocaleString()} has been ${status}.${notes ? ` Admin note: ${notes}` : ""}`,
      related_id: payment.id,
    });
    setUpdating(false);
    onSuccess();
    onOpenChange(false);
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Tenant</p>
              <p className="font-medium">{payment.tenant_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unit</p>
              <p className="font-medium">{payment.unit_number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p className="font-medium">R{payment.amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Period</p>
              <p className="font-medium">{payment.month_year}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Current Status</p>
            <StatusBadge status={payment.status} />
          </div>
          {payment.proof_file_url && (
            <a href={payment.proof_file_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700">
              <ExternalLink className="w-4 h-4" /> View Proof of Payment
            </a>
          )}
          <div>
            <Label className="text-xs">Admin Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes..." className="h-20" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleAction("rejected")} disabled={updating}
            className="text-red-600 border-red-200 hover:bg-red-50">
            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
            Reject
          </Button>
          <Button onClick={() => handleAction("verified")} disabled={updating}
            className="bg-green-600 hover:bg-green-700 text-white">
            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
