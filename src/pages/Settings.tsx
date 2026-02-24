import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Moon, Globe, Shield, HelpCircle, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { user } = useAuth();

  const settingsItems = [
    { icon: Moon, label: "Appearance", desc: "Dark mode, theme" },
    { icon: Globe, label: "Language", desc: "English" },
    { icon: Shield, label: "Privacy & Security", desc: "Password, 2FA" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us" },
    { icon: Info, label: "About", desc: "Version 1.0.0" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card px-4 py-3 shadow-sm">
        <Link to="/profile"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Settings</h1>
      </header>
      <div className="divide-y divide-border bg-card mx-4 mt-4 rounded-xl shadow-sm">
        {settingsItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>
      {user && (
        <p className="text-center text-xs text-muted-foreground mt-8">
          Signed in as {user.email}
        </p>
      )}
    </div>
  );
};

export default Settings;
