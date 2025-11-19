import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

type CategoryItem = { category?: string; name?: string; total?: string | number };

type Props = {
  data: CategoryItem[];
  title?: string;
};

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
];

const CategoryPieChart: React.FC<Props> = ({ data, title }) => {
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
    total: { label: title || 'Total' },
  };

  return (
    <div className="w-full flex items-center justify-center">
      <ChartContainer config={config} className="h-64 w-full max-w-[420px] flex items-center justify-center">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent labelKey="total" nameKey="name" />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export default CategoryPieChart;