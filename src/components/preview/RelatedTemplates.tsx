import { useTemplates } from "@/hooks/useTemplates";
import TemplateCard from "@/components/TemplateCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const RelatedTemplates = () => {
  const { data: templates, isLoading } = useTemplates({ limit: 4 });
  const { t } = useTranslation();

  return (
    <div className="mt-16 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {t("related.title")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t("related.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl overflow-hidden bg-card border border-border">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : (
          templates?.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              image={template.image_url}
              title={template.title}
              category={template.category}
              price={Number(template.price)}
              rating={Number(template.rating)}
              sales={template.sales}
              reviewCount={template.review_count}
              featured={template.featured}
              youtubeId={template.youtube_id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RelatedTemplates;
