import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SimpleLineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  valueLabel?: string;
}

export function SimpleLineChart({ data, color = "#ef4444", valueLabel = "Value" }: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis
            dataKey="label"
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#141414",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [`${value} ${valueLabel}`, ""]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
