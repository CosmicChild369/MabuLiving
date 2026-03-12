import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);
    const msgs = await base44.entities.Message.list("-created_date", 50);
    const myMsgs = msgs.filter(m => m.sender_email === me.email || m.recipient_email === me.email);
    setMessages(myMsgs.reverse());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    await base44.entities.Message.create({ sender_email: user.email, sender_name: user.full_name, recipient_email: "admin", subject: "Message from tenant", content: newMessage.trim() });
    setNewMessage("");
    setSending(false);
    loadData();
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-200 rounded-xl" />)}</div>;

  return (
    <div className="max-w-3xl flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <div className="mb-4"><h1 className="text-xl font-bold text-slate-900">Messages</h1><p className="text-sm text-slate-500">Chat with property management</p></div>
      <Card className="flex-1 border-0 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? <EmptyState icon={MessageSquare} title="No messages" description="Start a conversation" className="h-full" /> : messages.map(m => {
            const isMine = m.sender_email === user?.email;
            return <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}><div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-[#0f172a] text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"}`}><p className="text-sm leading-relaxed">{m.content}</p><p className="text-[10px] mt-1 text-slate-400">{format(new Date(m.created_date), "h:mm a")}</p></div></div>
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t border-slate-100 flex gap-2"><Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="border-slate-200" /><Button onClick={handleSend} disabled={!newMessage.trim() || sending} className="bg-amber-500 hover:bg-amber-600 text-white px-4">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button></div>
      </Card>
    </div>
  );
}
