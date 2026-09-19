import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Template } from "@/hooks/useTemplates";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateGalleryProps {
  template: Template;
}

const TemplateGallery = ({ template }: TemplateGalleryProps) => {
  const allImages = [
    { id: 0, src: template.image_url, label: "Aperçu principal" },
    ...(template.gallery_images || []).map((src, index) => ({
      id: index + 1,
      src,
      label: `Capture ${index + 1}`,
    })),
  ];

  const [activeImage, setActiveImage] = useState(allImages[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const navigateLightbox = (dir: number) => {
    setLightboxIndex((prev) => (prev + dir + allImages.length) % allImages.length);
  };

  if (allImages.length === 1) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Aperçu du modèle
          </h2>
        </div>
        <div
          className="rounded-xl overflow-hidden border border-border/50 shadow-md cursor-pointer group relative"
          onClick={() => openLightbox(0)}
        >
          <img
            src={template.image_url}
            alt={template.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <Lightbox
          images={allImages}
          index={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={navigateLightbox}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Captures d'écran
          </h2>
          <button
            onClick={() => openLightbox(allImages.findIndex((i) => i.id === activeImage.id))}
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
          >
            <Maximize2 className="w-4 h-4" />
            Voir en plein écran
          </button>
      </div>

      {/* Main Image */}
      <div
        className="rounded-xl overflow-hidden border border-border/50 shadow-md cursor-pointer group relative"
        onClick={() => openLightbox(allImages.findIndex((i) => i.id === activeImage.id))}
      >
        <img
          src={activeImage.src}
          alt={activeImage.label}
          className="w-full h-[400px] object-cover transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {allImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setActiveImage(image)}
            onDoubleClick={() => openLightbox(index)}
            className={cn(
              "relative rounded-lg overflow-hidden border-2 transition-all duration-200",
              activeImage.id === image.id
                ? "border-primary shadow-glow-green"
                : "border-transparent hover:border-primary/50"
            )}
          >
            <img
              src={image.src}
              alt={image.label}
              className="w-full h-16 md:h-20 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-xs text-white font-medium">{image.label}</span>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        images={allImages}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={navigateLightbox}
      />
    </div>
  );
};

// Lightbox component
interface LightboxProps {
  images: { id: number; src: string; label: string }[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (dir: number) => void;
}

const Lightbox = ({ images, index, open, onClose, onNavigate }: LightboxProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_STEP = 0.5;
  const MAX_ZOOM = 2;
  const MIN_ZOOM = 1;

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [index]);

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(MAX_ZOOM, +(prev + ZOOM_STEP).toFixed(1)));
  };

  const zoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, +(prev - ZOOM_STEP).toFixed(1));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom === 1) setZoom(MAX_ZOOM);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (images.length === 0) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center overflow-hidden"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-sm flex items-center gap-2">
            <span>{index + 1} / {images.length}</span>
            {zoom > 1 && (
              <span className="text-xs text-white/50">
                ({Math.round(zoom * 100)}%)
              </span>
            )}
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image with zoom */}
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={containerRef}
              className="overflow-hidden rounded-lg select-none"
              style={{
                maxWidth: zoom > 1 ? "98vw" : "90vw",
                maxHeight: zoom > 1 ? "95vh" : "85vh",
                cursor: zoom === 1 ? "zoom-in" : (isDragging ? "grabbing" : "grab"),
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleImageClick}
            >
              <img
                src={images[index].src}
                alt={images[index].label}
                className="max-w-[90vw] max-h-[85vh] object-contain pointer-events-none transition-transform duration-200 ease-out"
                style={{
                  transform: zoom > 1
                    ? `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`
                    : "scale(1) translate(0, 0)",
                  transformOrigin: "center",
                }}
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Zoom controls */}
          {zoom > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <button
                onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white/70 text-xs min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); resetZoom(); }}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); onNavigate(i - index); }}
                  className={cn(
                    "w-16 h-12 rounded-md overflow-hidden border-2 transition-all shrink-0",
                    i === index ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  )}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateGallery;
