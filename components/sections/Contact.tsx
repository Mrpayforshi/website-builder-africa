interface ContactProps {
  address?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, { open: string; close: string }>;
  map_embed?: string;
  /** map_embed (usually a Google Maps iframe) is heavy — omitted in lite mode in favor of a plain text link. */
  liteMode?: boolean;
}

export function Contact({ address, phone, email, hours, map_embed, liteMode = false }: ContactProps) {
  return (
    <section className="contact">
      {address && <p className="contact__address">{address}</p>}
      {phone && <p className="contact__phone">{phone}</p>}
      {email && <p className="contact__email">{email}</p>}
      {hours && (
        <ul className="contact__hours">
          {Object.entries(hours).map(([day, times]) => (
            <li key={day}>
              {day}: {times.open} – {times.close}
            </li>
          ))}
        </ul>
      )}
            {map_embed && liteMode && address && (
        
          className="contact__map-link"
        
          className="contact__map-link"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Google Maps
        </a>
      )}
    </section>
  );
}
