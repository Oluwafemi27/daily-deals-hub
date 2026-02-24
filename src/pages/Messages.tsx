import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Get unique conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      // Group by other user
      const convMap = new Map<string, any>();
      (data ?? []).forEach((msg: any) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, { userId: otherId, lastMessage: msg });
        }
      });
      return Array.from(convMap.values());
    },
    enabled: !!user,
  });

  // Get messages for selected chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["chat-messages", selectedChat],
    queryFn: async () => {
      if (!user || !selectedChat) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedChat}),and(sender_id.eq.${selectedChat},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!user && !!selectedChat,
    refetchInterval: 3000,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !selectedChat || !newMessage.trim()) return;
      await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedChat,
        content: newMessage.trim(),
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <MessageCircle className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to view messages</p>
        <Link to="/auth"><Button>Sign in</Button></Link>
      </div>
    );
  }

  if (selectedChat) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
          <button onClick={() => setSelectedChat(null)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Chat</h1>
        </header>
        <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-2">
          {chatMessages.map((msg: any) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                msg.sender_id === user.id
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.content}
              <p className={cn("text-[10px] mt-1", msg.sender_id === user.id ? "text-primary-foreground/60" : "text-muted-foreground")}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
          {chatMessages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hello!</p>
          )}
        </div>
        <div className="fixed bottom-20 left-0 right-0 border-t border-border bg-card p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage.mutate()}
              className="flex-1"
            />
            <Button size="icon" onClick={() => sendMessage.mutate()} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Messages</h1>
      </header>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <MessageCircle className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation from a product page</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conv: any) => (
            <button
              key={conv.userId}
              onClick={() => setSelectedChat(conv.userId)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(conv.lastMessage.created_at).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
