import React from 'react';
import { Link } from 'react-router-dom';

interface RunningTextProps {
  items: { id: number; title: string }[];
  separator?: string;
}

const RunningText: React.FC<RunningTextProps> = ({ items, separator = ' • ' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Duplikasi item untuk memastikan loop yang mulus tanpa celah
  const duplicatedItems = [...items, ...items, ...items]; 

  return (
    <div className="relative w-full overflow-hidden bg-blue-100 py-2 border-y border-blue-200 group">
      <div className="whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
        {duplicatedItems.map((item, index) => (
          <Link
            to={`/berita/${item.id}`}
            key={`${item.id}-${index}`}
            className="inline-block px-4 text-blue-800 font-medium text-lg hover:text-blue-600 hover:underline transition-colors"
          >
            {item.title}
            <span className="text-blue-400 no-underline">{index < duplicatedItems.length - 1 && separator}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RunningText;