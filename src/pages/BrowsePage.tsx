import { useNavigate } from 'react-router-dom';
import { CategoryTile } from '@/components/browse/CategoryTile';
import { BROWSE_CATEGORIES } from '@/config/browseCategories';
import { useSearchStore } from '@/store/searchStore';

export function BrowsePage() {
  const navigate = useNavigate();
  const setQuery = useSearchStore((s) => s.setQuery);

  function openCategory(name: string) {
    setQuery(name);
    navigate('/search');
  }

  return (
    <section className="pt-6 pb-8">
      <h1 className="text-large-title font-bold text-label">Browse</h1>
      <p className="mt-2 text-body text-label-secondary">Find music by genre and mood.</p>

      <h2 className="mt-8 text-section font-bold text-label">Genres and Moods</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {BROWSE_CATEGORIES.map((category) => (
          <CategoryTile
            key={category.name}
            name={category.name}
            color={category.color}
            imageUrl={category.imageUrl}
            onSelect={openCategory}
          />
        ))}
      </div>
    </section>
  );
}
