import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Notifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <Bell className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-semibold">Sign in to view notifications</p>
        <Link to="/auth"><Button>Sign in</Button></Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            <Check className="mr-1 h-3 w-3" /> Read all
          </Button>
        )}
      </header>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Bell className="h-16 w-16 text-muted-foreground" />
          <p className="mt-3 text-lg font-semibold">No notifications</p>
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((n: any) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                !n.is_read && "bg-primary/5"
              )}
            >
              <div className={cn(
                "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                n.is_read ? "bg-transparent" : "bg-primary"
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
