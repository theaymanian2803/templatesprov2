import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, User, ArrowRight, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Veuillez entrer une adresse email valide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Connexion échouée",
              description: "Email ou mot de passe incorrect. Veuillez réessayer.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Connexion échouée",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Bon retour !",
            description: "Vous êtes connecté avec succès.",
          });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Inscription échouée",
              description: "Cet email est déjà utilisé. Connectez-vous plutôt.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Inscription échouée",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Compte créé !",
            description: "Bienvenue sur Unccodestore !",
          });
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Échec de réinitialisation",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: "Email envoyé !",
          description: "Vérifiez votre boîte de réception pour le lien de réinitialisation.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password View
  if (isForgotPassword) {
    if (resetEmailSent) {
      return (
        <main className="min-h-screen bg-white">
          <Navbar />
          
          <div className="pt-9 pb-16">
            <div className="container mx-auto max-w-md">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Vérifiez votre email
                </h1>
                <p className="text-gray-500 mb-6">
                  Nous avons envoyé un lien de réinitialisation à <strong className="text-gray-900">{email}</strong>
                </p>
                <Button
                  variant="outline"
                  className="gap-2 border-gray-300 text-gray-700 hover:border-orange-300"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetEmailSent(false);
                    setEmail("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Button>
              </div>
            </div>
          </div>
          
          <Footer />
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        
        <div className="pt-9 pb-16">
          <div className="container mx-auto max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-gray-500">
                Entrez votre email et nous vous enverrons un lien de réinitialisation
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrors({});
                  }}
                  className="text-orange-500 font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
              {isLogin ? "Bon retour" : "Créer un compte"}
            </h1>
            <p className="text-gray-500">
              {isLogin 
                ? "Connectez-vous pour accéder à vos favoris et achats" 
                : "Rejoignez-nous pour sauvegarder vos favoris et suivre vos commandes"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nom d'affichage</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Votre nom"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrors({});
                      }}
                      className="text-sm text-orange-500 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "Créer un compte"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-orange-500 font-medium hover:underline"
                >
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default Auth;