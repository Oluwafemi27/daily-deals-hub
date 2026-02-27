import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminUsers = () => {
  const { roles } = useAuth();
  const qc = useQueryClient();
  const isAdmin = roles.includes("admin");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: allRoles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p: any) => ({
        ...p,
        roles: (allRoles ?? []).filter((r: any) => r.user_id === p.user_id).map((r: any) => r.role),
      }));
    },
    enabled: isAdmin,
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Role added" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Role removed" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center"><p>Access denied</p></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-foreground px-4 py-3 pt-safe">
        <Link to="/admin-panel" className="text-background"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-background">Manage Users</h1>
      </header>

      <div className="p-4 space-y-3">
        {isLoading ? <p className="text-center text-muted-foreground py-8">Loading...</p> :
          users.map((u: any) => (
            <Card key={u.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{u.display_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{u.user_id?.slice(0, 8)}...</p>
                    <div className="flex gap-1 mt-2">
                      {u.roles.map((r: string) => (
                        <Badge key={r} variant={r === "admin" ? "destructive" : r === "seller" ? "secondary" : "default"} className="text-[10px]">
                          {r}
                          {r !== "admin" && (
                            <button className="ml-1" onClick={() => removeRole.mutate({ userId: u.user_id, role: r })}>×</button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Select onValueChange={(role) => addRole.mutate({ userId: u.user_id, role })}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue placeholder="Add role" />
                    </SelectTrigger>
                    <SelectContent>
                      {["buyer", "seller", "admin"].filter(r => !u.roles.includes(r)).map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

export default AdminUsers;
