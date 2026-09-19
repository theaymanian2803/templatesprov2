import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
  ExternalLink,
  Copy,
  Terminal,
  Upload,
  FolderOpen,
  Crown,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "212694784176";

interface HostingStep {
  title: string
  description: string
  details: string[]
  command?: string
  link_url?: string
  link_label?: string
}

interface HostingPlatform {
  id: string
  name: string
  tagline: string
  enabled: boolean
  color: string
  steps: HostingStep[]
}

const platformsData: HostingPlatform[] = [
  {
    id: 'lovable',
    name: 'Lovable',
    tagline: 'Le plus simple — aucune configuration nécessaire',
    enabled: true,
    color: 'bg-primary text-primary-foreground',
    steps: [
      { title: 'Extrayez votre template', description: 'Décompressez les fichiers du template téléchargé dans un dossier sur votre ordinateur.', details: ['Localisez le fichier .zip téléchargé', 'Extrayez-le dans un dossier de votre choix', 'Ouvrez le dossier pour vérifier que tous les fichiers sont présents'] },
      { title: 'Créez un projet Lovable', description: 'Allez sur Lovable et créez un nouveau projet, puis téléversez ou importez le code de votre template.', details: ['Visitez lovable.dev et connectez-vous', 'Cliquez sur "Nouveau projet" depuis le tableau de bord', 'Décrivez votre template ou collez le code pour commencer'], link_url: 'https://lovable.dev', link_label: 'Ouvrir Lovable' },
      { title: 'Publiez votre site', description: 'Cliquez sur le bouton Publier dans le coin supérieur droit pour mettre votre site en ligne.', details: ['Cliquez sur le bouton "Publier" dans l\'éditeur', 'Votre site sera en ligne sur un domaine .lovable.app', 'Connectez éventuellement un domaine personnalisé dans Paramètres → Domaines'] },
    ],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    tagline: 'Idéal pour les projets React et Next.js',
    enabled: true,
    color: 'bg-foreground text-background',
    steps: [
      { title: 'Poussez sur GitHub', description: 'Téléversez le code de votre template dans un dépôt GitHub.', details: ['Créez un nouveau dépôt sur GitHub', 'Initialisez git dans votre dossier de template', 'Poussez le code vers votre dépôt'], command: 'git init && git add . && git commit -m "Initial commit" && git push' },
      { title: 'Importez dans Vercel', description: 'Connectez votre dépôt GitHub à Vercel pour des déploiements automatiques.', details: ['Allez sur vercel.com et connectez-vous avec GitHub', 'Cliquez sur "Ajouter un nouveau projet"', 'Sélectionnez votre dépôt de template', 'Vercel détectera automatiquement les paramètres du framework'], link_url: 'https://vercel.com/new', link_label: 'Ouvrir Vercel' },
      { title: 'Déployez et lancez', description: 'Cliquez sur Déployer et votre site sera en ligne en quelques secondes.', details: ['Vérifiez les paramètres de build (généralement aucun changement requis)', 'Cliquez sur "Déployer"', 'Votre site sera en ligne sur un domaine .vercel.app', 'Ajoutez un domaine personnalisé dans Paramètres du projet → Domaines'] },
    ],
  },
  {
    id: 'netlify',
    name: 'Netlify',
    tagline: 'Déploiement simple par glisser-déposer',
    enabled: true,
    color: 'bg-[hsl(172,60%,40%)] text-white',
    steps: [
      { title: 'Construisez votre template', description: 'Exécutez la commande de build pour générer les fichiers prêts pour la production.', details: ['Ouvrez un terminal dans votre dossier de template', 'Installez d\'abord les dépendances', 'Exécutez la commande de build pour créer le dossier dist'], command: 'npm install && npm run build' },
      { title: 'Déployez sur Netlify', description: 'Glissez-déposez votre dossier de build ou connectez via Git.', details: ['Allez sur app.netlify.com et connectez-vous', 'Glissez le dossier "dist" sur la zone de déploiement', 'Ou cliquez sur "Ajouter un nouveau site" → "Importer depuis Git"'], link_url: 'https://app.netlify.com', link_label: 'Ouvrir Netlify' },
      { title: 'Configurez et lancez', description: 'Configurez votre domaine et vos paramètres de déploiement.', details: ['Votre site est en ligne sur un domaine .netlify.app', 'Allez dans Paramètres du site → Gestion du domaine', 'Ajoutez votre domaine personnalisé', 'Le SSL est automatiquement configuré'] },
    ],
  },
]

const proServiceData = {
  enabled: true,
  price: 0,
  title: 'Engager un Pro',
  description: 'Vous ne voulez pas gérer l\'hébergement ? Laissez nos experts déployer votre template pour vous.',
  features: ['Configuration de déploiement professionnelle', 'Configuration de domaine incluse', 'Configuration du certificat SSL', 'Délai de 24 heures'],
  cta_text: 'Démarrer via WhatsApp',
  contact_link: '/contact',
}

interface HostingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateTitle?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  "Extract": <FolderOpen className="w-5 h-5" />,
  "Build": <Terminal className="w-5 h-5" />,
  "Push": <Upload className="w-5 h-5" />,
  "Create": <Upload className="w-5 h-5" />,
  "Import": <Globe className="w-5 h-5" />,
  "Deploy": <Rocket className="w-5 h-5" />,
  "Publish": <Rocket className="w-5 h-5" />,
  "Configure": <Rocket className="w-5 h-5" />,
};

const getStepIcon = (title: string) => {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <Globe className="w-5 h-5" />;
};

const HostingWizard = ({ open, onOpenChange, templateTitle }: HostingWizardProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<HostingPlatform | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const platforms = platformsData.filter((p) => p.enabled);
  const proService = proServiceData;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedPlatform(null);
      setCurrentStep(0);
    }, 300);
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({ title: "Copié !", description: "Commande copiée dans le presse-papiers." });
  };

  const steps = selectedPlatform?.steps || [];
  const progress = selectedPlatform ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {!selectedPlatform ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-display flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Commencer l'hébergement
              </DialogTitle>
              <DialogDescription>
                {templateTitle
                  ? `Choisissez une plateforme pour héberger "${templateTitle}"`
                  : "Choisissez une plateforme d'hébergement pour votre template"}
              </DialogDescription>
            </DialogHeader>

            {platforms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune plateforme d'hébergement configurée.</p>
            ) : (
              <div className="grid gap-3 mt-4">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${p.color} flex items-center justify-center shrink-0`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.tagline}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}

                {/* Free Hosting Support via WhatsApp */}
                {proService?.enabled && (
                  <div className="mt-2 p-4 rounded-xl border-2 border-accent/50 bg-accent/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                      POPULAIRE
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{proService.title}</div>
                        <p className="text-xs text-muted-foreground mt-1">{proService.description}</p>
                        <ul className="mt-2 space-y-1">
                          {proService.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                              <Check className="w-3 h-3 text-accent shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-accent">Gratuit</span>
                          </div>
                          <Button
                            size="sm"
                            variant="accent"
                            className="gap-1"
                            onClick={() => {
                              const message = templateTitle
                                ? `Bonjour%2C%20je%20souhaite%20de%20l%27aide%20pour%20h%C3%A9berger%20mon%20template%20%22${encodeURIComponent(templateTitle)}%22`
                                : "Bonjour%2C%20je%20souhaite%20de%20l%27aide%20pour%20h%C3%A9berger%20mon%20template";
                              const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
                              handleClose();
                              setTimeout(() => {
                                const popup = window.open(url, "_blank", "noopener,noreferrer");
                                if (!popup) {
                                  window.location.href = url;
                                }
                              }, 400);
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Démarrer via WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={selectedPlatform.color}>
                  {selectedPlatform.name}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Étape {currentStep + 1} sur {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-1.5 mb-2" />
              <DialogTitle className="text-lg font-display flex items-center gap-2">
                {getStepIcon(steps[currentStep].title)}
                {steps[currentStep].title}
              </DialogTitle>
              <DialogDescription>{steps[currentStep].description}</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              {steps[currentStep].details.map((detail, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-sm text-foreground">{detail}</p>
                </div>
              ))}

              {steps[currentStep].command && (
                <div className="mt-4 bg-muted rounded-lg p-3 flex items-center gap-2">
                  <code className="text-xs text-foreground flex-1 font-mono break-all">
                    {steps[currentStep].command}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => handleCopyCommand(steps[currentStep].command!)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {steps[currentStep].link_url && (
                <a href={steps[currentStep].link_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 mt-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {steps[currentStep].link_label || "Ouvrir le lien"}
                  </Button>
                </a>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentStep === 0) setSelectedPlatform(null);
                  else setCurrentStep((s) => s - 1);
                }}
                className="gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 0 ? "Retour" : "Précédent"}
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentStep((s) => s + 1)} className="gap-1">
                  Suivant <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleClose} className="gap-1">
                  <Check className="w-4 h-4" /> Terminé
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HostingWizard;
