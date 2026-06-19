import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { FileText, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { to: "/", icon: FileText, label: t("nav.viewer") },
    { to: "/history", icon: History, label: t("nav.history") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <header className="border-b bg-background">
      <div className="flex items-center justify-between px-4 h-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          Textractor
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                location.pathname === to
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
