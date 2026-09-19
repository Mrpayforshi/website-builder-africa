// Enables the @modal parallel route: every page under /templates renders
// alongside whatever the @modal slot resolves to — nothing, by default
// (see @modal/default.tsx), or the intercepted preview dialog.
export default function TemplatesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
