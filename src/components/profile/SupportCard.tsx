import { Link } from "@/lib/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const SupportCard = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          {t('support.title')}
        </CardTitle>
        <CardDescription>
          {t('support.desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="default" className="gap-2 flex-1">
            <Link to="/contact">
              <MessageCircle className="w-4 h-4" />
              {t('support.contact')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 flex-1">
            <Link to="/faq">
              <FileText className="w-4 h-4" />
              {t('support.faq')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 flex-1">
            <Link to="/refunds">
              <HelpCircle className="w-4 h-4" />
              {t('support.refunds')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportCard;
