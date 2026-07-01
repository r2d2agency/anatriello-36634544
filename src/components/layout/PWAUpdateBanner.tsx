import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/version";

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const shouldWatchForUpdates = !isInIframe;

// Compara versões A.B.C.D — retorna true se `remote` > `local`
function isNewer(remote: string, local: string) {
  const a = remote.split(".").map((n) => parseInt(n, 10) || 0);
  const b = local.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0;
    const y = b[i] || 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

export function PWAUpdateBanner() {
  const [showPopup, setShowPopup] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState<string | null>(null);

  const checkVersion = useCallback(async () => {
    try {
      const response = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      const remote: string | undefined = data.version;
      if (!remote) return;

      // Versão local = a mais alta entre a compilada e a última já vista
      const stored = localStorage.getItem("app-version-seen") || APP_VERSION;
      const local = isNewer(APP_VERSION, stored) ? APP_VERSION : stored;

      if (isNewer(remote, local)) {
        setRemoteVersion(remote);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("[Update] Erro ao checar versão:", err);
    }
  }, []);

  useEffect(() => {
    if (!shouldWatchForUpdates) return;
    checkVersion();
    const interval = setInterval(checkVersion, 2 * 60 * 1000); // a cada 2 min
    const onFocus = () => checkVersion();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [checkVersion]);

  const handleUpdate = useCallback(async () => {
    setUpdating(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 12;
      });
    }, 180);

    try {
      // Limpa todos os caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Desregistra service workers para forçar recarregamento limpo
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // Limpa storage volátil de queries/UI (mantém login)
      try {
        sessionStorage.clear();
      } catch {}

      clearInterval(progressInterval);
      setProgress(100);
      setDone(true);

      if (remoteVersion) {
        localStorage.setItem("app-version-seen", remoteVersion);
      }

      setTimeout(() => {
        // força bypass de cache HTTP
        window.location.replace(window.location.pathname + "?v=" + Date.now());
      }, 900);
    } catch (err) {
      console.error("[Update] Falhou:", err);
      window.location.reload();
    }
  }, [remoteVersion]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={cn(
          "bg-card border rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
        )}
      >
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "p-4 rounded-full",
              done ? "bg-green-500/10" : "bg-primary/10",
            )}
          >
            {done ? (
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            ) : updating ? (
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <Sparkles className="h-10 w-10 text-primary" />
            )}
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground text-center">
          {done
            ? "Atualização concluída!"
            : updating
              ? "Atualizando sistema..."
              : "Nova versão disponível!"}
        </h3>

        <p className="text-sm text-muted-foreground text-center mt-2">
          {done
            ? "O sistema será recarregado em instantes."
            : updating
              ? "Limpando cache e baixando a nova versão."
              : "Uma nova versão com melhorias está disponível."}
        </p>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
            v{APP_VERSION}
          </span>
          {remoteVersion && (
            <>
              <span className="text-muted-foreground">→</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                v{remoteVersion}
              </span>
            </>
          )}
        </div>

        {(updating || done) && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {Math.round(progress)}%
            </p>
          </div>
        )}

        {!updating && !done && (
          <div className="flex flex-col gap-2 mt-5">
            <Button onClick={handleUpdate} className="w-full gap-2">
              <Download className="h-4 w-4" />
              Atualizar agora
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setShowPopup(false)}
            >
              Depois
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
