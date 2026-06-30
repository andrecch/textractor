import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { KeyRound, ArrowRight, Sparkles, ScanLine } from "lucide-react";
import { FileUpload } from "./FileUpload";

function WelcomeIllustration() {
  return (
    <svg
      width="220"
      height="160"
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <rect x="20" y="20" width="80" height="110" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" fill="none" />
      <line x1="32" y1="42" x2="88" y2="42" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />
      <line x1="32" y1="54" x2="78" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />
      <line x1="32" y1="66" x2="84" y2="66" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />
      <line x1="32" y1="78" x2="70" y2="78" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />
      <line x1="32" y1="90" x2="82" y2="90" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />
      <line x1="32" y1="102" x2="65" y2="102" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" strokeLinecap="round" />

      <rect x="40" y="50" width="50" height="35" rx="2" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none" strokeDasharray="4 3" />

      <path d="M95 67 C110 67, 115 67, 130 67" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0 0 L8 3 L0 6 Z" className="fill-primary" />
        </marker>
      </defs>

      <rect x="135" y="35" width="65" height="85" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-primary/60" fill="none" />
      <line x1="145" y1="52" x2="190" y2="52" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" />
      <line x1="145" y1="64" x2="185" y2="64" stroke="currentColor" strokeWidth="1.5" className="text-primary/70" strokeLinecap="round" />
      <line x1="145" y1="76" x2="188" y2="76" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" />
      <line x1="145" y1="88" x2="178" y2="88" stroke="currentColor" strokeWidth="1.5" className="text-primary/70" strokeLinecap="round" />
      <line x1="145" y1="100" x2="183" y2="100" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" />

      <circle cx="112" cy="67" r="10" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
      <path d="M108 67 L111 70 L117 64" stroke="currentColor" strokeWidth="1.5" className="text-primary" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full overflow-auto p-6">
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        <WelcomeIllustration />

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("welcome.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("welcome.subtitle")}</p>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
          {t("welcome.description")}
        </p>

        <div className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>{t("welcome.model")}</span>
          <span className="text-border">|</span>
          <ScanLine className="h-3 w-3 text-primary" />
          <span>{t("welcome.poweredBy")}</span>
        </div>

        <div className="w-full">
          <FileUpload />
        </div>

        <div className="w-full rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t("welcome.apiKeyTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("welcome.apiKeyDescription")}
              </p>
              <Link
                to="/settings"
                className="inline-flex items-center text-xs text-primary hover:underline mt-1"
              >
                {t("welcome.goToSettings")} <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
