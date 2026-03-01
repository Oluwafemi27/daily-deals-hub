import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Activity, Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  status: string;
  created_at: string;
  profile?: {
    display_name: string;
    store_name?: string;
  };
}

const AdminActivityLogs = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState("7days");

  const isAdmin = roles.includes("admin");

  const getDateQuery = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "24hours":
        startDate.setDate(now.getDate() - 1);
        break;
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return startDate.toISOString();
  };

  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ["activity-logs", actionFilter, statusFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*, profile:profiles(display_name, store_name)")
        .gte("created_at", getDateQuery())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (actionFilter !== "all") {
        query = query.eq("action_type", actionFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: isAdmin,
  });

  const filteredLogs = activityLogs?.filter((log) =>
    searchUser
      ? (log.profile?.display_name || "")
          .toLowerCase()
          .includes(searchUser.toLowerCase()) ||
        (log.profile?.store_name || "")
          .toLowerCase()
          .includes(searchUser.toLowerCase())
      : true
  );

  const actionTypes = activityLogs
    ? [...new Set(activityLogs.map((log) => log.action_type))]
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("insert"))
      return "bg-blue-100 text-blue-800";
    if (action.includes("update")) return "bg-purple-100 text-purple-800";
    if (action.includes("delete")) return "bg-red-100 text-red-800";
    if (action.includes("view") || action.includes("read"))
      return "bg-cyan-100 text-cyan-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleExport = () => {
    if (!filteredLogs) return;

    const csv = [
      ["Date", "User", "Action", "Entity Type", "Entity ID", "Status", "IP Address"],
      ...filteredLogs.map((log) => [
        new Date(log.created_at).toLocaleString(),
        log.profile?.display_name || "Unknown",
        log.action_type,
        log.entity_type || "-",
        log.entity_id || "-",
        log.status,
        log.ip_address || "-",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-panel")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">User Activity Logs</h1>
            <p className="text-muted-foreground">
              Track and monitor all user activities in the system
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search User
                </label>
                <Input
                  placeholder="Search by name or store..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Action Type
                </label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actionTypes.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24hours">Last 24 Hours</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Logs ({filteredLogs?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading activity logs...</p>
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.profile?.display_name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action_type)}>
                            {log.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.entity_type ? (
                            <span className="font-mono text-xs">
                              {log.entity_type}
                              {log.entity_id && ` (${log.entity_id.substring(0, 8)}...)`}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {log.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No activity logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminActivityLogs;
