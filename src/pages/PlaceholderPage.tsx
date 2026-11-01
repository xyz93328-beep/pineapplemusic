interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="pt-6">
      <h1 className="text-large-title font-bold text-label">{title}</h1>
      <p className="mt-2 text-body text-label-secondary">This section is built in a later stage.</p>
    </section>
  );
}
