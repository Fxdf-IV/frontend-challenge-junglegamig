export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  // centered container, title and fields share alignment (design review #48/#50)
  return (
    <section className="container-page flex justify-center py-12">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 sm:p-8">
        <p className="text-center text-lg font-bold tracking-[0.3em]">KURIO</p>
        <h1 className="mt-6 text-lg font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-xs text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
