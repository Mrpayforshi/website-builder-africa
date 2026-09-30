// Parallel-route layout: renders the gallery page alongside the @modal slot
// (empty by default, or the intercepted preview dialog).
export default function DashboardTemplatesLayout({
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
