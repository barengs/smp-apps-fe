import React from 'react';

interface RunningTextProps {
  items: string[];
  separator?: string;
}

const RunningText: React.FC<RunningTextProps> = ({ items, separator = ' • ' }) => {
  if (!items || items.length === 0) {
    return null;
  }

  // Duplikasi item untuk memastikan loop yang mulus tanpa celah
  const duplicatedItems = [...items, ...items, ...items]; 

  return (
    <div className="relative w-full overflow-hidden bg-blue-100 py-2 border-y border-blue-200">
      <div className="whitespace-nowrap animate-marquee">
        {duplicatedItems.map((item, index) => (
          <span key={index} className="inline-block px-4 text-blue-800 font-medium text-lg">
            {item}
            {index < duplicatedItems.length - 1 && separator}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RunningText;