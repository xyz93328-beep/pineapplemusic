interface CategoryTileProps {
  name: string;
  color: string;
  imageUrl: string;
  onSelect: (name: string) => void;
}

export function CategoryTile({ name, color, imageUrl, onSelect }: CategoryTileProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      style={{ backgroundColor: color }}
      className="group relative aspect-video overflow-hidden rounded-tile text-left transition-[transform] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.96]"
    >
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply grayscale transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent"
      />
      <span className="absolute bottom-3 left-4 right-4 truncate text-section font-bold text-white drop-shadow-md">
        {name}
      </span>
    </button>
  );
}
