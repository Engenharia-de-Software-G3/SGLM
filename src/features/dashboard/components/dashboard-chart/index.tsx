import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const data = [
  { day: '01', current: 25, previous: 20 },
  { day: '03', current: 30, previous: 25 },
  { day: '06', current: 35, previous: 30 },
  { day: '9', current: 25, previous: 35 },
  { day: '12', current: 20, previous: 25 },
  { day: '15', current: 60, previous: 40 },
  { day: '18', current: 25, previous: 30 },
  { day: '21', current: 20, previous: 25 },
  { day: '24', current: 60, previous: 50 },
  { day: '27', current: 65, previous: 55 },
  { day: '30', current: 85, previous: 75 },
  { day: '31', current: 100, previous: 80 },
];

export const DashboardChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Fluxo de locações</h3>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">Porcentagem x Dias</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-600">Métricas do Mês Passado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-blue-600">Métricas do Mês Atual</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value: number) => `${value}%`}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              name="Mês Passado"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Mês Atual"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
