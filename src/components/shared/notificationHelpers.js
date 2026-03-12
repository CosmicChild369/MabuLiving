import { base44 } from "@/api/base44Client";

export async function createNotification({ recipient_email, type, title, message, related_id }) {
  if (!recipient_email) return;
  await base44.entities.Notification.create({
    recipient_email,
    type,
    title,
    message,
    read: false,
    related_id: related_id || "",
  });
}
