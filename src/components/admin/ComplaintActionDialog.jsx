import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { createNotification } from "@/components/shared/notificationHelpers";

export default function ComplaintActionDialog({ complaint, open, onOpenChange, onSuccess }) {
  const [status, setStatus] = useState(complaint?.status || "received");
  const [response, setResponse] = useState(complaint?.admin_response || "");
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    const data = { status, admin_response: response };
    if (status === "resolved") {
      data.resolved_date = new Date().toISOString().split("T")[0];
    }
    await base44.entities.Complaint.update(complaint.id, data);
    if (response && response !== complaint.admin_response) {
      await createNotification({
        recipient_email: complaint.tenant_email,
        type: "complaint_response",
        title: `Update on: ${complaint.title}`,
        message: `Admin responded to your complaint. Status: ${status.replace("_", " ")}. ${response}`,
        related_id: complaint.id,
      });
    } else if (status !== complaint.status) {
      await createNotification({
        recipient_email: complaint.tenant_email,
        type: "complaint_response",
        title: `Complaint Status Updated`,
        message: `Your complaint "${complaint.title}" status changed to: ${status.replace("_", " ")}.`,
        related_id: complaint.id,
      });
    }
    setUpdating(false);
    onSuccess();
    onOpenChange(false);
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Complaint</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">{complaint.title}</p>
            <p className="text-xs text-slate-500 mt-1">{complaint.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Tenant</p>
              <p className="font-medium">{complaint.tenant_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Unit</p>
              <p className="font-medium">{complaint.unit_number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Type</p>
              <Badge variant="outline" className="capitalize text-xs">{complaint.type}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Priority</p>
              <Badge variant="outline" className="capitalize text-xs">{complaint.priority}</Badge>
            </div>
          </div>
          {complaint.attachments?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {complaint.attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700">
                    <ExternalLink className="w-3 h-3" /> File {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs">Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Admin Response</Label>
            <Textarea value={response} onChange={e => setResponse(e.target.value)}
              placeholder="Response to tenant..." className="h-20" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updating}
            className="bg-amber-500 hover:bg-amber-600 text-white">
            {updating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
