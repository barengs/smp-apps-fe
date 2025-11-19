import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

type Violator = {
  id?: string | number;
  first_name?: string;
  last_name?: string | null;
  nis?: string;
  total_violations?: string | number;
};

type Props = {
  data: Violator[];
  title?: string;
};

const TopViolatorsChart: React.FC<Props> = ({ data, title }) => {
  const chartData = React.useMemo(
    () =>
      data.map((v) => {
        const name = [v.first_name, v.last_name].filter(Boolean).join(' ').trim();
        const label = name || (v.nis ? `NIS ${v.nis}` : 'Tanpa nama');
        const total =
          typeof v.total_violations === 'string'
            ? Number(v.total_violations)
            : typeof v.total_violations === 'number'
              ? v.total_violations
              : 0;
        return { name: label, total };
      }),
    [data],
  );

  const config = {
    total: { label: title || 'Pelanggaran', color: 'hsl(var(--accent))' },
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
            height={60}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent labelKey="total" nameKey="total" />} />
          <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default TopViolatorsChart;