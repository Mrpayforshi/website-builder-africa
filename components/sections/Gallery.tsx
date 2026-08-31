import { LITE_MODE_GALLERY_IMAGE_LIMIT } from "@/lib/market-fit/bandwidth";

interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
  /** In lite mode only the first LITE_MODE_GALLERY_IMAGE_LIMIT images render at all. */
  liteMode?: boolean;
}

export function Gallery({ images = [], liteMode = false }: GalleryProps) {
  if (images.length === 0) {
    return <section className="gallery gallery--empty">Gallery coming soon.</section>;
  }

  const visibleImages = liteMode ? images.slice(0, LITE_MODE_GALLERY_IMAGE_LIMIT) : images;
  const hiddenCount = images.length - visibleImages.length;

  return (
    <section className="gallery">
      {visibleImages.map((image) => (
        <figure key={image.url}>
          <img src={image.url} alt={image.caption ?? ""} loading="lazy" decoding="async" />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
      {hiddenCount > 0 && (
        <p className="gallery__lite-notice">
          {hiddenCount} more photo{hiddenCount === 1 ? "" : "s"} hidden in lite mode.
        </p>
      )}
    </section>
  );
}
