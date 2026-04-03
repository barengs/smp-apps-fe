import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRightCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClassicInfoBoxProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  href?: string;
  description?: string;
  className?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-info', // We'll need to define these in tailwind or use hex
    bgHex: 'bg-[#17a2b8]',
    hover: 'hover:bg-[#138496]',
    footer: 'bg-black/10',
  },
  green: {
    bgHex: 'bg-[#28a745]',
    hover: 'hover:bg-[#218838]',
    footer: 'bg-black/10',
  },
  yellow: {
    bgHex: 'bg-[#ffc107]',
    hover: 'hover:bg-[#e0a800]',
    footer: 'bg-black/10',
    text: 'text-dark',
  },
  red: {
    bgHex: 'bg-[#dc3545]',
    hover: 'hover:bg-[#c82333]',
    footer: 'bg-black/10',
  },
  purple: {
    bgHex: 'bg-[#6f42c1]',
    hover: 'hover:bg-[#5a32a3]',
    footer: 'bg-black/10',
  },
  orange: {
    bgHex: 'bg-[#fd7e14]',
    hover: 'hover:bg-[#e36209]',
    footer: 'bg-black/10',
  },
};

const ClassicInfoBox: React.FC<ClassicInfoBoxProps> = ({
  title,
  value,
  icon,
  color,
  href,
  description,
  className,
}) => {
  const styles = colorMap[color];
  const isYellow = color === 'yellow';

  const Content = (
    <div className={cn(
      "relative overflow-hidden rounded-sm shadow-md transition-all duration-300",
      styles.bgHex,
      isYellow ? "text-[#212529]" : "text-white",
      className
    )}>
      <div className="p-4 pt-5 pb-10">
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold mb-1 leading-none">{value}</h3>
          <p className="text-sm font-medium opacity-80">{title}</p>
        </div>
        
        {/* Icon Overlay */}
        <div className="absolute top-2 right-2 opacity-20 transition-transform duration-300 group-hover:scale-110 pointer-events-none">
          {React.cloneElement(icon as React.ReactElement, {
            size: 70,
            strokeWidth: 1.5
          })}
        </div>
      </div>

      {href ? (
        <Link 
          to={href} 
          className={cn(
            "flex items-center justify-center gap-1 py-1 text-xs transition-colors group",
            styles.footer,
            isYellow ? "text-[#212529]/80 hover:text-[#212529]" : "text-white/80 hover:text-white"
          )}
        >
          More info <ArrowRightCircle className="h-3 w-3 ml-1" />
        </Link>
      ) : (
        <div className={cn("h-6", styles.footer)} />
      )}
    </div>
  );

  return Content;
};

export default ClassicInfoBox;
