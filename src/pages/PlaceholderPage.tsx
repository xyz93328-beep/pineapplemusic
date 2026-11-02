interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-2 pb-32 pt-8">
      <h1 className="text-large-title font-bold text-label">{title}</h1>
      <p className="text-body text-label-secondary">Coming soon.</p>
    </div>
  );
}
