import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const AdminReports = () => {
  const { roles } = useAuth();
  if (!roles.includes("admin")) return <div className="flex min-h-screen items-center justify-center"><p>Access denied</p></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-foreground px-4 py-3 pt-safe">
        <Link to="/admin-panel" className="text-background"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-background">Reports & Moderation</h1>
      </header>
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">No reports yet</p>
        <p className="text-sm text-muted-foreground mt-1">User reports and flagged content will appear here.</p>
      </div>
    </div>
  );
};

export default AdminReports;
