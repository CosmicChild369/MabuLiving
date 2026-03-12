import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createNotification } from "@/components/shared/notificationHelpers";

export default function AnnouncementDialog({ open, onOpenChange, user, onSuccess, announcement }) {
  const [form, setForm] = useState({
    title: announcement?.title || "",
    content: announcement?.content || "",
    category: announcement?.category || "general",
    priority: announcement?.priority || "normal",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    const data = { ...form, published: true, author_name: user?.full_name };
    if (announcement) {
      await base44.entities.Announcement.update(announcement.id, data);
    } else {
      const newAnn = await base44.entities.Announcement.create(data);
      const tenants = await base44.entities.TenantProfile.filter({ status: "active" });
      await Promise.all(tenants.map(t =>
        t.user_email ? createNotification({
          recipient_email: t.user_email,
          type: "announcement",
          title: `📢 New Announcement: ${form.title}`,
          message: form.content.slice(0, 120) + (form.content.length > 120 ? "…" : ""),
          related_id: newAnn?.id || "",
        }) : Promise.resolve()
      ));
    }
    setSubmitting(false);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit" : "New"} Announcement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["general","maintenance","payment","safety","event","policy"].map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Content</Label>
            <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Write your announcement..." className="h-32" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.title || !form.content || submitting}
            className="bg-amber-500 hover:bg-amber-600 text-white">
            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {announcement ? "Update" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
