import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  store_name?: string;
}

const AdminNotifications = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationType, setNotificationType] = useState("general");
  const [sendToAll, setSendToAll] = useState(false);
  const isAdmin = roles.includes("admin");

  const { data: users } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, display_name, store_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: isAdmin,
  });

  const { data: sentNotifications } = useQuery({
    queryKey: ["sent-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      const usersToNotify = sendToAll
        ? users?.map((u) => u.user_id) || []
        : selectedUsers;

      if (!notificationTitle.trim()) {
        throw new Error("Title is required");
      }

      if (usersToNotify.length === 0) {
        throw new Error("Please select at least one user or select 'Send to All'");
      }

      const notifications = usersToNotify.map((userId) => ({
        user_id: userId,
        title: notificationTitle,
        body: notificationBody || null,
        type: notificationType,
        is_read: false,
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        `Notification sent to ${sendToAll ? "all users" : selectedUsers.length + " user(s)"}`
      );
      setNotificationTitle("");
      setNotificationBody("");
      setSelectedUsers([]);
      setSendToAll(false);
      setNotificationType("general");
      queryClient.invalidateQueries({ queryKey: ["sent-notifications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send notification");
    },
  });

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-lg font-bold">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-panel")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Send Notifications</h1>
            <p className="text-muted-foreground">
              Send notifications to users and track delivery
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Send Notification Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Compose Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notification Title *
                  </label>
                  <Input
                    placeholder="e.g., New Deal Available"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notification Body
                  </label>
                  <Textarea
                    placeholder="Optional message body..."
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="kyc">KYC Update</SelectItem>
                      <SelectItem value="order">Order Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={sendToAll}
                      onChange={(e) => {
                        setSendToAll(e.target.checked);
                        setSelectedUsers([]);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">
                      Send to All Users ({users?.length || 0})
                    </span>
                  </label>

                  {!sendToAll && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Select Users ({selectedUsers.length} selected)
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                        {users && users.length > 0 ? (
                          users.map((user) => (
                            <label
                              key={user.user_id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.user_id)}
                                onChange={() => handleUserToggle(user.user_id)}
                                className="rounded"
                              />
                              <span className="text-sm">
                                {user.display_name || user.store_name || "Unknown User"}
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No users found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => sendNotificationMutation.mutate()}
                  disabled={
                    sendNotificationMutation.isPending ||
                    !notificationTitle.trim() ||
                    (!sendToAll && selectedUsers.length === 0)
                  }
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendNotificationMutation.isPending
                    ? "Sending..."
                    : "Send Notification"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notifications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sentNotifications && sentNotifications.length > 0 ? (
                  sentNotifications.map((notif: any) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-muted rounded-lg text-sm border"
                    >
                      <div className="font-medium line-clamp-2">{notif.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {notif.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No notifications sent yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
