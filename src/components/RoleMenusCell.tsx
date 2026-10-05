"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetRoleMenusQuery } from '@/store/slices/roleApi';

interface RoleMenusCellProps {
  roleId: number;
}

const RoleMenusCell: React.FC<RoleMenusCellProps> = ({ roleId }) => {
  const { data, isLoading, isError } = useGetRoleMenusQuery(roleId);

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (isError || !data || data.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const titles = data.map((m) => m.id_title || m.en_title || m.ar_title || String(m.id));

  if (titles.length === 1) {
    return <Badge variant="outline">{titles[0]}</Badge>;
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="inline-block"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {titles.length} Menu
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 max-h-72 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Daftar Menu ({titles.length})
          </div>
          <div className="space-y-1">
            {titles.map((title, index) => (
              <Badge
                key={`${title}-${index}`}
                variant="secondary"
                className="block w-full text-left font-normal whitespace-normal py-1"
              >
                {title}
              </Badge>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RoleMenusCell;