import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/store/searchStore';
import { BROWSE_CATEGORIES } from '@/config/browseCategories';
import { cn } from '@/lib/cn';

export function BrowsePage() {
  const setQuery = useSearchStore((s) => s.setQuery);
  const navigate = useNavigate();

  function handleSelect(query: string) {
    setQuery(query);
    navigate('/search');
  }

  return (
    <section className="pb-32 pt-6">
      <h1 className="text-large-title font-bold text-label">Browse</h1>
      <p className="mt-1 text-body text-label-secondary">Tap a genre to start exploring.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {BROWSE_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleSelect(cat.query)}
            className="group relative aspect-[5/3] overflow-hidden rounded-tile text-left transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: cat.color }}
            aria-label={`Browse ${cat.name}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 text-body font-bold text-white drop-shadow">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
