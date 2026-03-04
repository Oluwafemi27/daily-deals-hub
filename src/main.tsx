import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "@/hooks/use-toast";

// Catch unhandled rejections to help debug login or network issues
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Only show toast for critical errors that would break the UX
  if (event.reason instanceof Error &&
     (event.reason.message.includes("fetch") || event.reason.message.includes("network"))) {
    toast({
      title: "Network error",
      description: "We are having trouble connecting to the server. Please check your connection.",
      variant: "destructive"
    });
  }
});

createRoot(document.getElementById("root")!).render(<App />);
