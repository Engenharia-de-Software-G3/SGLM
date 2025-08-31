import { Card } from '@/components/ui/card';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const performanceData = [
  { day: 1, value: 25 },
  { day: 5, value: 30 },
  { day: 10, value: 35 },
  { day: 15, value: 60 },
  { day: 20, value: 25 },
  { day: 25, value: 30 },
  { day: 30, value: 87 },
];

export const PerformanceChart = () => {
  return (
    <Card className="p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Desempenho Geral do cliente</h3>
        <p className="text-sm text-gray-600 mb-4">Porcentagem de Entregas em dia e sem problemas</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value: number) => [`Porcentagem: ${value}%`]}
              labelFormatter={(label) => `Dia ${label}`}
              labelStyle={{ fontSize: '12px', color: '#374151' }}
              contentStyle={{ fontSize: '12px', backgroundColor: 'white', borderColor: '#e5e7eb' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
