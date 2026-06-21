// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import istaLogo from "@/assets/ista.jpeg";
import {
  Moon,
  Sun,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { i18n } from "@/lib/i18n";

export function LoginPage() {
  const { login, forgotPassword } = useAuth();
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("L'adresse e-mail est requise.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (!password) {
      setError("Le mot de passe est requis.");
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(i18n.common.success_login);
      navigate("/home", { replace: true });
    } catch (err: any) {
      console.error("[Login Error]", err);

      let message = "Une erreur est survenue lors de la connexion.";

      // 1. Gestion des erreurs réseau (Serveur éteint, pas d'internet, etc.)
      if (
        err instanceof TypeError &&
        err.message.toLowerCase().includes("fetch")
      ) {
        message =
          "Le serveur est injoignable. Vérifiez votre connexion ou l'état du serveur.";
      }
      // 2. Gestion des erreurs spécifiques de l'API (codes HTTP) — ApiError avec status 0 indique network/CORS
      else if (err && (err.name === "ApiError" || err.status !== undefined)) {
        const status = err.status;
        if (status === 0) {
          // En cas réseau/proxy, utiliser le message normalisé du client API.
          message =
            (err.message && String(err.message)) ||
            "Le serveur est injoignable. Vérifiez votre connexion ou l'état du serveur.";

          // If the ApiError carries additional body information, append a short hint
          if (err.body) {
            try {
              const b =
                typeof err.body === "object"
                  ? JSON.stringify(err.body)
                  : String(err.body);
              message += `\nDétails: ${b}`;
            } catch {
              // ignore JSON stringify errors
            }
          }
        } else if (status === 401) {
          message = "Identifiants incorrects. Veuillez réessayer.";
        } else if (status === 404) {
          message = "Service d'authentification introuvable (404).";
        } else if (status === 500) {
          message = "Erreur interne du serveur. Veuillez réessayer plus tard.";
        } else if (
          err.isGateway ||
          status === 502 ||
          status === 503 ||
          status === 504
        ) {
          message =
            err.message ||
            "Le serveur de passerelle (proxy) ne répond pas. Vérifiez la configuration du proxy et l'état du backend.";
        } else {
          message = err.message || message;
        }
      }
      // 3. Fallback sur le message d'erreur standard
      else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(i18n.common.error_email);
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      toast.success(i18n.common.success_reset);
      setShowForgot(false);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (setter: (val: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError(null);
    };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Header — même style qu'AppLayout ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <img
            src={istaLogo}
            alt="Logo ISTA"
            className="size-8 shrink-0 rounded-lg object-cover border border-border bg-white p-0.5 shadow-sm"
          />
          <div className="leading-none">
            <p className="text-[11px] font-black uppercase tracking-tighter text-foreground">
              ISTA PORTAL
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary">
              Goma · Management
            </p>
          </div>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label={
            theme === "dark" ? i18n.common.light_mode : i18n.common.dark_mode
          }
        >
          {theme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </Button>
      </header>

      {/* ── Main ── */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Card — identique aux cards de l'app */}
          <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            {/* Card Header */}
            <div className="flex flex-col space-y-1.5 p-6 pb-0">
              {/* Bouton retour (mode forgot) */}
              {showForgot && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setError(null);
                  }}
                  className="mb-2 -ml-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Retour
                </button>
              )}

              <h1 className="text-xl font-black uppercase italic tracking-tight text-foreground">
                {showForgot ? "Réinitialisation" : "Connexion"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {showForgot
                  ? "Saisissez votre e-mail pour recevoir un lien de réinitialisation."
                  : "Accédez à votre espace selon votre rôle."}
              </p>
            </div>

            {/* Separator */}
            <div className="mx-6 my-4 h-px bg-border" />

            {/* Form */}
            <form onSubmit={showForgot ? handleForgotPassword : handleLogin}>
              <div className="space-y-4 px-6 pb-4">
                {error && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="text-xs font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Adresse e-mail
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@ista-goma.cd"
                      className="h-10 pl-10"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={handleInputChange(setEmail)}
                      aria-invalid={
                        !!error &&
                        (error.toLowerCase().includes("e-mail") ||
                          error.includes("requis"))
                      }
                    />
                  </div>
                </div>

                {/* Password */}
                {!showForgot && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >
                        Mot de passe
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgot(true);
                          setError(null);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
                      >
                        Oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="h-10 pl-10 pr-10"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={handleInputChange(setPassword)}
                        aria-invalid={
                          !!error &&
                          (error.toLowerCase().includes("passe") ||
                            error.includes("requis"))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="mx-6 h-px bg-border" />

              {/* Card Footer */}
              <div className="p-6 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 font-bold uppercase tracking-widest text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : showForgot ? (
                    "Envoyer le lien"
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50">
            © {new Date().getFullYear()} ISTA-GOMA
          </p>
        </div>
      </main>
    </div>
  );
}
