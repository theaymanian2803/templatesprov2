import { Link } from "@/lib/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PurchasedTemplate } from "@/hooks/useDashboard";

interface ReviewReminderBannerProps {
  templates: PurchasedTemplate[];
}

const ReviewReminderBanner = ({ templates }: ReviewReminderBannerProps) => {
  const { t } = useTranslation();
  if (templates.length === 0) return null;

  const first = templates[0];

  return (
    <Card className="mb-8 border-accent/30 bg-accent/5">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {templates.length === 1
                ? t('reviewReminder.single', { title: first.template_title })
                : t('reviewReminder.multiple', { count: templates.length })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('reviewReminder.hint')}
            </p>
          </div>
        </div>
        <Link to={`/template/${first.template_id}`}>
          <Button size="sm" variant="outline" className="gap-1 border-accent/30 text-accent hover:bg-accent/10">
            {t('reviewReminder.cta')} <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ReviewReminderBanner;
