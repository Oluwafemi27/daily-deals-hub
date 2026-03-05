import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useRefresh } from "@/hooks/useRefresh";
import { useEnsureProfile } from "@/hooks/useEnsureProfile";

const AppLayout = () => {
  const refresh = useRefresh();
  useEnsureProfile(); // Ensure profile exists on app load

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PullToRefresh onRefresh={refresh}>
        <main className="pb-20 flex-1">
          <Outlet />
        </main>
      </PullToRefresh>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
