"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SantriData {
  year: number;
  santri: number;
}

const data: SantriData[] = [
  { year: 2020, santri: 150 },
  { year: 2021, santri: 180 },
  { year: 2022, santri: 220 },
  { year: 2023, santri: 250 },
  { year: 2024, santri: 280 },
];

const SantriGrowthChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pertumbuhan Santri (5 Tahun Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
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