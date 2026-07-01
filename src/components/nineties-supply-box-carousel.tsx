"use client";

import { useEffect, useRef, useState } from "react";
import image1 from "../../assets/90 supply/Untitled-1.jpg";
import image2 from "../../assets/90 supply/Untitled-2.jpg";
import image3 from "../../assets/90 supply/Untitled-3.jpg";
import image4 from "../../assets/90 supply/Untitled-4.jpg";
import image5 from "../../assets/90 supply/Untitled-5.jpg";
import image6 from "../../assets/90 supply/Untitled-6.jpg";
import BoxCarousel, {
  type BoxCarouselRef,
  type CarouselItem,
} from "@/components/fancy/carousel/box-carousel";
import styles from "./nineties-supply-box-carousel.module.css";

const images = [image1, image2, image3, image4, image5, image6];

const carouselItems: CarouselItem[] = images.map((image, index) => ({
  alt: `90 Supply campaign image ${index + 1}`,
  id: `90-supply-${index + 1}`,
  src: image.src,
  type: "image",
}));

type CarouselSize = {
  width: number;
  height: number;
};

type NinetiesSupplyBoxCarouselProps = {
  attentionHintKey?: string | number;
};

export function NinetiesSupplyBoxCarousel({
  attentionHintKey,
}: NinetiesSupplyBoxCarouselProps) {
  const carouselRef = useRef<BoxCarouselRef>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<CarouselSize | null>(null);

  useEffect(() => {
    const element = measureRef.current;

    if (element === null) {
      return;
    }

    const updateSize = (width: number) => {
      const measuredWidth = Math.round(width * 100) / 100;
      const measuredHeight = measuredWidth * 0.8;

      setSize((currentSize) =>
        currentSize?.width === measuredWidth &&
        currentSize.height === measuredHeight
          ? currentSize
          : { height: measuredHeight, width: measuredWidth },
      );
    };
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry !== undefined) {
        updateSize(entry.contentRect.width);
      }
    });

    updateSize(element.getBoundingClientRect().width);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={styles.layer}
      data-nineties-supply-carousel=""
    >
      <div className={styles.positioner}>
        <div
          className={styles.measure}
          data-nineties-supply-collision-target=""
          ref={measureRef}
        >
          {size === null || size.width === 0 ? null : (
            <BoxCarousel
              attentionHintKey={attentionHintKey}
              className={styles.carousel}
              height={size.height}
              items={carouselItems}
              ref={carouselRef}
              width={size.width}
            />
          )}
        </div>
        <div className={styles.controls}>
          <button
            aria-label="Previous 90 Supply image"
            className={styles.control}
            onClick={() => carouselRef.current?.prev()}
            type="button"
          >
            <span aria-hidden="true">{"\u2190"}</span>
          </button>
          <button
            aria-label="Next 90 Supply image"
            className={styles.control}
            onClick={() => carouselRef.current?.next()}
            type="button"
          >
            <span aria-hidden="true">{"\u2192"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
