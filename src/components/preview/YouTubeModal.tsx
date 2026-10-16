import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface YouTubeModalProps {
  youtubeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const YouTubeModal = ({ youtubeId, open, onOpenChange }: YouTubeModalProps) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={t('previewUi.videoTitle')}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeModal;
