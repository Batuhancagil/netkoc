"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MonthlyBarChart({
  data,
  subjectCodes,
}: {
  data: { label: string; [subjectCode: string]: number | string }[];
  subjectCodes: string[];
}) {
  const palette = [
    "#2563eb",
    "#16a34a",
    "#eab308",
    "#dc2626",
    "#9333ea",
    "#0891b2",
    "#ea580c",
    "#4b5563",
    "#db2777",
    "#0d9488",
  ];
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="label" fontSize={11} />
        <YAxis fontSize={11} />
        <Tooltip />
        <Legend />
        {subjectCodes.map((code, i) => (
          <Bar key={code} dataKey={code} stackId="s" fill={palette[i % palette.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
