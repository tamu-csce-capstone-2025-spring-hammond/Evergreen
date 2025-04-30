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
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import React from "react";
import { useThemeFromLocalStorage } from "@/utils";

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

export default function ForecastTrendChart({
  historical,
  forecast,
}: ForecastChartProps) {
  console.log(forecast);
  const forecastAvg = forecast[2];

  const isDarkTheme = useThemeFromLocalStorage();

  const forecastMin = forecast[0];
  const forecastMax = forecast[4];

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
        borderWidth: 1, // Add this line to make the trendline thinner
        pointRadius: 1, // Makes the dots smaller (default is 3)
        pointHoverRadius: 3, // Optional: Slightly larger on hover for better UX
      },
      {
        label: "Forecast Range",
        data: [...new Array(historical.length).fill(null), ...forecastMax],
        borderColor: "transparent",
        backgroundColor: "rgba(147, 197, 253, 0.3)",
        fill: "-1",
        pointRadius: 0,
      },
      {
        label: "Forecast Range Min",
        data: [...new Array(historical.length).fill(null), ...forecastMin],
        borderColor: "transparent",
        backgroundColor: "rgba(147, 197, 253, 0.3)",
        fill: 1,
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
          unit: "month", // shows one tick per month
          displayFormats: {
            month: "MMM yyyy", // e.g., "Apr 2025"
          },
        },
        title: {
          display: false,
        },
        ticks: {
          color: isDarkTheme ? "#D5D5D4" : "#535352",
        },
        grid: {
          color: isDarkTheme ? "#535352" : "#E6E6E5",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: false,
        },
        ticks: {
          callback: (val: number) => `$${val}`,
          color: isDarkTheme ? "#D5D5D4" : "#535352",
        },
        grid: {
          color: isDarkTheme ? "#535352" : "#E6E6E5",
        },
        border: {
          color: isDarkTheme ? "#535352" : "#E6E6E5",
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
            if (
              ctx.dataset.label === "Forecast Range" ||
              ctx.dataset.label === "Forecast Range Min"
            ) {
              return null;
            }
            return `$${ctx.parsed.y.toFixed(2)}`;
          },
        },
        backgroundColor: isDarkTheme ? "#535352" : "#E6E6E5",
        titleColor: isDarkTheme ? "#E6E6E5" : "#272726",
        bodyColor: isDarkTheme ? "#E6E6E5" : "#535352",
      },
    },
  };

  return (
    <div className="w-full [&_canvas]:!w-[100%] [&_canvas]:!h-[auto]">
      <Line data={chartData} options={options} />
    </div>
  );
}
