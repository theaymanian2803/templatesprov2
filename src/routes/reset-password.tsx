import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const passwordSchema = useMemo(() => z.string().min(6, t('resetPassword.passwordMin')), [t]);

  // Check if user arrived via reset link (token in URL query)
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      toast({
        title: t('resetPassword.invalidLink'),
        description: t('resetPassword.invalidLinkDesc'),
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [navigate, toast, t]);

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.issues[0].message;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('resetPassword.mismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        toast({
          title: t('resetPassword.resetFailed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsComplete(true);
        toast({
          title: t('resetPassword.updatedTitle'),
          description: t('resetPassword.updatedDesc'),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-9 pb-16">
          <div className="container mx-auto max-w-md">
            <div className="glass-card p-8 rounded-2xl border border-border/50 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                {t('resetPassword.doneHeading')}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t('resetPassword.doneDesc')}
              </p>
              <Button
                variant="hero"
                size="lg"
                className="gap-2"
                onClick={() => navigate("/")}
              >
                {t('resetPassword.backHome')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-9 pb-16">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              {t('resetPassword.heading')}
            </h1>
            <p className="text-muted-foreground">
              {t('resetPassword.subtitle')}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border/50 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">{t('resetPassword.newPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('resetPassword.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {t('resetPassword.update')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export const Route = createFileRoute('/reset-password')({ component: ResetPassword })
