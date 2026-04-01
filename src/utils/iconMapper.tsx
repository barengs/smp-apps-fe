import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Maps icon name strings from the API to Lucide React icon components
 * @param iconName - The kebab-case icon name from the database (e.g., 'layout-dashboard')
 * @param className - Optional className for the icon
 * @returns React icon component or Circle as fallback
 */
const faToLucideMap: Record<string, string> = {
  'exchange-alt': 'arrow-right-left',
  'file-invoice-dollar': 'receipt',
  'file-alt': 'file-text',
  'shield-alt': 'shield',
  'user-graduate': 'graduation-cap',
  'user-friends': 'users',
  'chalkboard-teacher': 'presentation',
  'user-tie': 'user-round',
  'calendar-alt': 'calendar-days',
  'list-alt': 'list-todo',
  'chalkboard': 'library',
  'layer-group': 'layers',
  'info-circle': 'info',
  'bullhorn': 'megaphone',
  'city': 'building-2',
  'road': 'route',
  'tree': 'tree-pine',
  'window-maximize': 'maximize',
  'sitemap': 'network',
  'user-shield': 'shield-check',
  'exclamation-triangle': 'alert-triangle',
  'mosque': 'landmark',
  'calendar-day': 'calendar-days',
};

export const getIconComponent = (
  iconName: string,
  className: string = 'h-5 w-5'
): React.ReactNode => {
  if (!iconName) {
    return <LucideIcons.Circle className={className} />;
  }

  // Use mapped name if it matches a legacy FontAwesome icon
  const mappedName = faToLucideMap[iconName] || iconName;

  // Convert kebab-case to PascalCase
  const pascalCaseName = mappedName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[pascalCaseName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" (${pascalCaseName}) not found in Lucide icons, using Circle as fallback`);
    return <LucideIcons.Circle className={className} />;
  }

  return <IconComponent className={className} />;
};

/**
 * Get icon component for child menu items (smaller size)
 */
export const getChildIconComponent = (iconName: string): React.ReactNode => {
  return getIconComponent(iconName, 'h-4 w-4');
};
