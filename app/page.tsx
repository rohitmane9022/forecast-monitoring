"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { filterForecastsByHorizon } from "@/lib/dataUtils";
import { format, parseISO } from "date-fns";

type DataPoint = {
  startTime: string;
  generation: number;
};

type ForecastPoint = {
  startTime: string;
  publishTime: string;
  generation: number;
};

type ChartPoint = {
  time: string;
  actual?: number;
  forecast?: number;
};

export default function Home() {
  const [fromDate, setFromDate] = useState("2024-01-01");
  const [toDate, setToDate] = useState("2024-01-07");
  const [horizon, setHorizon] = useState(4);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setChartData([]);

    try {
      const [actualsRes, forecastsRes] = await Promise.all([
        fetch(`/api/actuals?from=${fromDate}&to=${toDate}`),
        fetch(`/api/forecasts?from=${fromDate}&to=${toDate}`),
      ]);

      const actuals: DataPoint[] = await actualsRes.json();
      const forecastsRaw: ForecastPoint[] = await forecastsRes.json();

      if (!Array.isArray(actuals) || !Array.isArray(forecastsRaw)) {
        throw new Error("Invalid data returned from API");
      }

      const forecasts = filterForecastsByHorizon(forecastsRaw, horizon);

      const actualsMap: Record<string, number> = {};
      for (const a of actuals) {
        actualsMap[a.startTime] = a.generation;
      }

      const forecastMap: Record<string, number> = {};
      for (const f of forecasts) {
        forecastMap[f.startTime] = f.generation;
      }

      const allTimes = Array.from(
        new Set([...Object.keys(actualsMap), ...Object.keys(forecastMap)])
      ).sort();

      const merged: ChartPoint[] = allTimes.map((t) => ({
        time: t,
        actual: actualsMap[t],
        forecast: forecastMap[t],
      }));

      setChartData(merged);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, horizon]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatXAxis = (tick: string) => {
    try {
      return format(parseISO(tick), "dd/MM HH:mm");
    } catch {
      return tick;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
          <p className="text-gray-400 mb-1">
            {format(parseISO(label), "dd MMM yyyy HH:mm")}
          </p>
          {payload.map((entry: any) => (
            entry.value !== undefined && (
              <p key={entry.name} style={{ color: entry.color }}>
                {entry.name}:{" "}
                <span className="font-bold">{entry.value?.toFixed(0)} MW</span>
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  const avgActual = chartData.filter((d) => d.actual).length
    ? Math.round(
        chartData.filter((d) => d.actual).reduce((s, d) => s + (d.actual || 0), 0) /
          chartData.filter((d) => d.actual).length
      )
    : 0;

  const avgForecast = chartData.filter((d) => d.forecast).length
    ? Math.round(
        chartData.filter((d) => d.forecast).reduce((s, d) => s + (d.forecast || 0), 0) /
          chartData.filter((d) => d.forecast).length
      )
    : 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          🌬️ Wind Power Forecast Monitor
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          UK National Wind Generation — Actual vs Forecast
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 rounded-2xl p-4 md:p-6 mb-5 border border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* From Date */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start Time</label>
            <input
              type="date"
              value={fromDate}
              min="2024-01-01"
              max="2024-01-31"
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">End Time</label>
            <input
              type="date"
              value={toDate}
              min="2024-01-01"
              max="2024-01-31"
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Horizon Slider */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Forecast Horizon:{" "}
              <span className="text-white font-semibold">{horizon} hrs</span>
            </label>
            <input
              type="range"
              min={0}
              max={48}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full accent-green-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0h</span>
              <span>24h</span>
              <span>48h</span>
            </div>
          </div>

          {/* Apply Button */}
          <div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg p-4 mb-5 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-800">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <div className="w-6 h-0.5 bg-blue-400" />
            <span className="text-gray-300">Actual Generation</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <div className="w-6 h-px bg-green-400" style={{ borderTop: "2px dashed #34D399" }} />
            <span className="text-gray-300">Forecasted Generation</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 md:h-96 text-gray-500">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-3">⚙️</div>
              <p className="text-sm">Fetching data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 md:h-96 text-gray-500 text-sm">
            No data available for selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={typeof window !== "undefined" && window.innerWidth < 768 ? 280 : 420}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                stroke="#4B5563"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#4B5563"
                tick={{ fontSize: 10 }}
                width={55}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                label={{
                  value: "MW",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#6B7280",
                  fontSize: 11,
                  dx: 10,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#60A5FA"
                dot={false}
                strokeWidth={2}
                name="Actual"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#34D399"
                dot={false}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats */}
      {chartData.length > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: "Data Points", value: chartData.length, unit: "" },
            { label: "Avg Actual", value: avgActual, unit: "MW" },
            { label: "Avg Forecast", value: avgForecast, unit: "MW" },
            { label: "Horizon", value: horizon, unit: "hrs" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-4 text-center"
            >
              <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
              <p className="text-white text-xl md:text-2xl font-bold">
                {stat.value.toLocaleString()}
                <span className="text-gray-400 text-xs ml-1">{stat.unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}