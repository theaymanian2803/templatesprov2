import { Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemplateFeaturesProps {
  features: string[];
}

const TemplateFeatures = ({ features }: TemplateFeaturesProps) => {
  const { t } = useTranslation();
  // If no features, don't render the section
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            {t('previewUi.featuresTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('previewUi.featuresSubtitle')}
          </p>
      </div>

      {/* Features List */}
      <div className="glass-card p-6 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{t('previewUi.featuresAllIncluded')}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateFeatures;
