import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerSlide {
  title: string;
  subtitle?: string;
  gradient: string;
  emoji?: string;
}

interface BannerSlideshowProps {
  slides: BannerSlide[];
  autoPlayMs?: number;
}

const BannerSlideshow = ({ slides, autoPlayMs = 4000 }: BannerSlideshowProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), autoPlayMs);
    return () => clearInterval(timer);
  }, [slides.length, autoPlayMs]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "min-w-full p-6 text-primary-foreground",
              slide.gradient
            )}
          >
            {slide.emoji && <span className="text-3xl">{slide.emoji}</span>}
            <h3 className="mt-2 text-xl font-extrabold">{slide.title}</h3>
            {slide.subtitle && (
              <p className="mt-1 text-sm opacity-90">{slide.subtitle}</p>
            )}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/30 p-1 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4 text-primary-foreground" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/30 p-1 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4 text-primary-foreground" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-4 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlideshow;
