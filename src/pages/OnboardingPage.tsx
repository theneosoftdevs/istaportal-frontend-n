import { Link } from "react-router-dom"
import { Moon, Sun, Download, ArrowRight } from "lucide-react"
import istaLogo from "@/assets/ista.jpeg"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/AppContext"
import { toast } from "sonner"

export function OnboardingPage() {
  const { theme, toggleTheme } = useApp()

  const handleInstall = () => {
    const prompt = (window as any).deferredPrompt
    if (!prompt) {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone
      ) {
        toast.info("Application déjà installée.")
      } else {
        toast.info("Menu navigateur → « Ajouter à l'écran d'accueil »")
      }
      return
    }
    prompt.prompt()
    prompt.userChoice.then((result: { outcome: string }) => {
      if (result.outcome === "accepted") toast.success("Installation réussie !")
      ;(window as any).deferredPrompt = null
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="size-8 overflow-hidden rounded-lg border border-border/60 bg-white p-0.5 shadow-sm">
            <img src={istaLogo} alt="ISTA" className="size-full object-cover rounded-sm" />
          </div>
          <span className="text-sm font-black uppercase tracking-tighter text-foreground">
            ISTA PORTAL
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label="Thème"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </header>

      {/* Center */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 text-center">
        {/* Logo */}
        <div className="size-20 overflow-hidden rounded-2xl border border-border bg-white p-1.5 shadow-lg">
          <img src={istaLogo} alt="ISTA GOMA" className="size-full object-cover rounded-xl" />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
            ISTA PORTAL
          </h1>
          <p className="text-sm text-muted-foreground">
            Institut Supérieur des Techniques Appliquées · Goma
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <Link to="/login" className="w-full">
            <Button
              size="lg"
              className="w-full h-12 gap-2 font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            >
              Se connecter
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={handleInstall}
            className="w-full h-12 gap-2 font-bold uppercase tracking-widest text-sm"
          >
            <Download className="size-4" />
            Installer l'application
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
          © {new Date().getFullYear()} ISTA-GOMA
        </p>
      </footer>
    </div>
  )
}
