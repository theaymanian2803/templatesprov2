import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, FileText } from "lucide-react";

const SupportCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          Besoin d'aide ?
        </CardTitle>
        <CardDescription>
          Des questions sur vos commandes, modèles ou compte ? Nous sommes là pour vous aider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="default" className="gap-2 flex-1">
            <Link to="/contact">
              <MessageCircle className="w-4 h-4" />
              Contacter le support
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 flex-1">
            <Link to="/faq">
              <FileText className="w-4 h-4" />
              Voir la FAQ
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 flex-1">
            <Link to="/refunds">
              <HelpCircle className="w-4 h-4" />
              Politique de remboursement
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportCard;
