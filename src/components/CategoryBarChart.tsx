import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

type CategoryItem = { category?: string; name?: string; total?: string | number };

type Props = {
  data: CategoryItem[];
  title?: string;
};

const CategoryBarChart: React.FC<Props> = ({ data, title }) => {
  const chartData = React.useMemo(
    () =>
      data.map((d) => ({
        name: (d.category || d.name || 'Tidak diketahui') as string,
        total:
          typeof d.total === 'string'
            ? Number(d.total)
            : typeof d.total === 'number'
              ? d.total
              : 0,
      })),
    [data],
  );

  const config = {
    total: { label: title || 'Total', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-2">
      <ChartContainer config={config} className="h-64">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            tickMargin={8}
            interval={0}
            height={48}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent labelKey="total" nameKey="total" />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default CategoryBarChart;