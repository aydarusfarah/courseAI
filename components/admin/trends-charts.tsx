"use client";

import { Card } from "../card";

interface Trends {
  labels: string[];
  userGrowth: number[];
  revenue: number[];
  aiUsage: number[];
  courseCreation: number[];
  subscriptionGrowth: number[];
}

interface AdminTrendsChartsProps {
  trends: Trends;
}

const W = 480;
const H = 120;
const PAD = { top: 12, right: 12, bottom: 28, left: 36 };

function sparkline(values: number[], color: string, fill: string): React.ReactNode {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xs = values.map((_, i) => PAD.left + (i / Math.max(values.length - 1, 1)) * innerW);
  const ys = values.map((v) => PAD.top + innerH - (v / max) * innerH);

  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1].toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  return (
    <>
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill={color} />
      ))}
    </>
  );
}

function Chart({ title, values, labels, color, fill, prefix = "", suffix = "" }: {
  title: string;
  values: number[];
  labels: string[];
  color: string;
  fill: string;
  prefix?: string;
  suffix?: string;
}) {
  const max = Math.max(...values, 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  return (
    <Card className="space-y-3 p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-sm font-bold text-slate-950">
          {prefix}{values.reduce((a, b) => a + b, 0).toFixed(prefix === "$" ? 2 : 0)}{suffix}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Y-axis ticks */}
        {[0, 0.5, 1].map((frac) => {
          const y = PAD.top + innerH - frac * innerH;
          const val = frac * max;
          return (
            <g key={frac}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                {prefix}{val.toFixed(0)}{suffix}
              </text>
            </g>
          );
        })}
        {sparkline(values, color, fill)}
        {/* X labels */}
        {labels.map((label, i) => {
          const x = PAD.left + (i / Math.max(labels.length - 1, 1)) * innerW;
          return (
            <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{label}</text>
          );
        })}
      </svg>
    </Card>
  );
}

export default function AdminTrendsCharts({ trends }: AdminTrendsChartsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-950">6-Month Trends</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <Chart
          title="User Growth"
          values={trends.userGrowth}
          labels={trends.labels}
          color="#3b82f6"
          fill="rgba(59,130,246,0.08)"
        />
        <Chart
          title="Revenue"
          values={trends.revenue}
          labels={trends.labels}
          color="#10b981"
          fill="rgba(16,185,129,0.08)"
          prefix="$"
        />
        <Chart
          title="AI Generations"
          values={trends.aiUsage}
          labels={trends.labels}
          color="#8b5cf6"
          fill="rgba(139,92,246,0.08)"
        />
        <Chart
          title="New Courses"
          values={trends.courseCreation}
          labels={trends.labels}
          color="#f59e0b"
          fill="rgba(245,158,11,0.08)"
        />
      </div>
    </div>
  );
}
