"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";
import React from "react";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  LineController,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  historical: { date: string; value: number }[];
  forecast: number[][];
}

export default function ForecastTrendChart({ historical, forecast }: ForecastChartProps) {
  const forecastAvg = forecast[0].map((_, i) => {
    const vals = forecast.map((sim) => sim[i]);
    return vals.reduce((sum, v) => sum + v, 0) / vals.length;
  });

  const forecastMin = forecast[0].map((_, i) => Math.min(...forecast.map((sim) => sim[i])));
  const forecastMax = forecast[0].map((_, i) => Math.max(...forecast.map((sim) => sim[i])));

  const lastHistDate = new Date(historical[historical.length - 1].date);

  const forecastLabels = forecastAvg.map((_, i) => {
    const d = new Date(lastHistDate);
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  const chartData = {
    labels: [...historical.map((d) => d.date), ...forecastLabels],
    datasets: [
      {
        label: "Portfolio Value",
        data: [...historical.map((d) => d.value), ...forecastAvg],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: false,
      },
      {
        label: "Forecast Range",
        data: [...new Array(historical.length).fill(null), ...forecastMax],
        borderColor: "transparent",
        backgroundColor: "rgba(147, 197, 253, 0.3)",
        fill: '-1',
        pointRadius: 0,
      },
      {
        label: "Forecast Range Min",
        data: [...new Array(historical.length).fill(null), ...forecastMin],
        borderColor: "transparent",
        backgroundColor: "rgba(147, 197, 253, 0.3)",
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options: any = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
        },
        title: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: false,
        },
        ticks: {
          callback: (val: number) => `$${val}`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === "Forecast Range" || ctx.dataset.label === "Forecast Range Min") {
              return null;
            }
            return `$${ctx.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full [&_canvas]:!w-[100%] [&_canvas]:!h-[auto]">
      <Line data={chartData} options={options} />
    </div>
  );
}
