import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  subject: z.string().trim().min(1, "Objet requis").max(200),
  message: z.string().trim().min(1, "Message requis").max(2000),
});

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  templateTitle?: string;
}

const ContactModal = ({ open, onOpenChange, templateId, templateTitle }: ContactModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("contacts").insert([{
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
      template_id: templateId || null,
      template_title: templateTitle || null,
    }]);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Erreur lors de l'envoi du message", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Message envoyé !", description: "Nous vous répondrons sous peu." });
    setForm({ name: "", email: "", subject: "", message: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nous contacter</DialogTitle>
          <DialogDescription>
            {templateTitle
              ? `Une question à propos de "${templateTitle}" ? Envoyez-nous un message.`
              : "Une question ? Envoyez-nous un message."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nom</Label>
            <Input
              id="contact-name"
              placeholder="Votre nom"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">E-mail</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Objet</Label>
            <Input
              id="contact-subject"
              placeholder="De quoi s'agit-il ?"
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              placeholder="Votre message..."
              rows={4}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
