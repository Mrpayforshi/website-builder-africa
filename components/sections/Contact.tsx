interface ContactProps {
  address?: string;
  phone?: string;
  email?: string;
  hours?: Record<string, { open: string; close: string }>;
  map_embed?: string;
}

export function Contact({ address, phone, email, hours, map_embed }: ContactProps) {
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
      {map_embed && <div className="contact__map" dangerouslySetInnerHTML={{ __html: map_embed }} />}
    </section>
  );
}
