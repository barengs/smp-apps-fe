"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetStudentStatisticsByPeriodQuery } from '@/store/slices/dashboardApi';
import { Skeleton } from '@/components/ui/skeleton';

interface SantriData {
  year: string; // Changed to string to accommodate "period" like "2020/2021"
  santri: number;
}

const SantriGrowthChart: React.FC = () => {
  const { data, isLoading, isError } = useGetStudentStatisticsByPeriodQuery();

  const chartData: SantriData[] = React.useMemo(() => {
    if (!data?.data) return [];

    // Sort data by period (assuming period is sortable string like "YYYY/YYYY")
    const sortedData = [...data.data].sort((a, b) => a.period.localeCompare(b.period));

    // Take the last 5 periods
    const lastFivePeriods = sortedData.slice(-5);

    return lastFivePeriods.map(item => ({
      year: item.period, // Map period to year
      santri: item.total, // Map total to santri
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pertumbuhan Santri (5 Periode Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-8">Gagal memuat data pertumbuhan santri.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pertumbuhan Santri (5 Periode Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="santri" fill="#8884d8" name="Jumlah Santri" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SantriGrowthChart;