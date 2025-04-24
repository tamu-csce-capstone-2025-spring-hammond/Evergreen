"use client";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Legend,
  Tooltip,
  ChartOptions,
  ChartData,
  Plugin,
} from "chart.js";
import { useEffect, useState } from "react";
import { PortfolioCardProps, InvestmentData } from "../api/portfolio";

ChartJS.register(ArcElement, Tooltip, Legend);


interface PieChartProps {
  portfolios?: PortfolioCardProps[];
  data?: InvestmentData[];
  showLegend: boolean;
}

export default function PieChart({ portfolios, data, showLegend }: PieChartProps) {
  const [chartData, setChartData] = useState<ChartData<"doughnut"> | null>(null);
  const [total, setTotal] = useState<number>(0);

  // Show center total only for portfolios
  const showCenterTotal = portfolios && portfolios.length > 0;

  useEffect(() => {
    if (portfolios && portfolios.length > 0) {
      const totalValue = portfolios.reduce((sum, p) => sum + p.total, 0);
      setTotal(totalValue);

      const portfolioChart = {
        labels: portfolios.map((p) => p.name),
        datasets: [
          {
            data: portfolios.map((p) => p.total),
            backgroundColor: portfolios.map((p) => p.color),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      };
      setChartData(portfolioChart);
    } else if (data && data.length > 0) {
      const defaultColors = ["#2563eb", "#f97316", "#10b981", "#e11d48", "#a855f7"];
      const totalValue = data.reduce((sum, d) => sum + d.value, 0);
      setTotal(totalValue);

      const dataset = {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d, i) => d.color || defaultColors[i % defaultColors.length]),
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      };
      setChartData(dataset);
    }
  }, [portfolios, data]);

  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height } = chart;
      const ctx = chart.ctx;
      ctx.save();

      const fontSize = (height / 170).toFixed(2);
      ctx.font = `${fontSize}em Roboto Mono, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "#737373";

      const text = `$${total.toFixed(2)}`;
      ctx.fillText(text, width / 2, height / 2);
      ctx.restore();
    },
  };

  if (!chartData) {
    return <p className="text-center text-evergray-400">No data to display</p>;
  }

  const options: ChartOptions<"doughnut"> = {
    cutout: "70%",
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom",
        labels: {
          padding: 16,
          boxWidth: 16,
          color: "#4B5563", 
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.formattedValue || "0";
            return `${label}: $${value}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={`w-full h-full relative`}>
      <Doughnut
        data={chartData}
        options={options}
        plugins={showCenterTotal ? [centerTextPlugin] : []}
      />
    </div>
  );
}
