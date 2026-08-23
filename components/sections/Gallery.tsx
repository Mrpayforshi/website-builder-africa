interface GalleryImage {
  url: string;
  caption?: string;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export function Gallery({ images = [] }: GalleryProps) {
  if (images.length === 0) {
    return <section className="gallery gallery--empty">Gallery coming soon.</section>;
  }

  return (
    <section className="gallery">
      {images.map((image) => (
        <figure key={image.url}>
          <img src={image.url} alt={image.caption ?? ""} />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
    </section>
  );
}
