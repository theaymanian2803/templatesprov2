import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { submitContact } from "@/server/functions/contact";
import { Loader2, Send } from "lucide-react";
import { z } from "zod";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  templateTitle?: string;
}

const ContactModal = ({ open, onOpenChange, templateId, templateTitle }: ContactModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t("contactModal.nameRequired")).max(100),
        email: z.string().trim().email(t("contactModal.emailInvalid")).max(255),
        subject: z.string().trim().min(1, t("contactModal.subjectRequired")).max(200),
        message: z.string().trim().min(1, t("contactModal.messageRequired")).max(2000),
      }),
    [t],
  );

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
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    let error: Error | null = null;
    try {
      await submitContact({
        data: {
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject,
          message: result.data.message,
          templateId: templateId,
          templateTitle: templateTitle,
        },
      });
    } catch (e: any) {
      error = e;
    }

    setIsSubmitting(false);

    if (error) {
      toast({ title: t("contactModal.errorTitle"), description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("contactModal.sentTitle"), description: t("contactModal.sentDesc") });
    setForm({ name: "", email: "", subject: "", message: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("contactModal.title")}</DialogTitle>
          <DialogDescription>
            {templateTitle
              ? t("contactModal.descriptionWithTemplate", { title: templateTitle })
              : t("contactModal.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">{t("contactModal.name")}</Label>
            <Input
              id="contact-name"
              placeholder={t("contactModal.namePlaceholder")}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">{t("contactModal.email")}</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder={t("contactModal.emailPlaceholder")}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">{t("contactModal.subject")}</Label>
            <Input
              id="contact-subject"
              placeholder={t("contactModal.subjectPlaceholder")}
              value={form.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">{t("contactModal.message")}</Label>
            <Textarea
              id="contact-message"
              placeholder={t("contactModal.messagePlaceholder")}
              rows={4}
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSubmitting ? t("contactModal.sending") : t("contactModal.send")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
