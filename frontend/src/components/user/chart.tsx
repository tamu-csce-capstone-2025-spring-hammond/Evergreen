import { useState, useEffect } from "react";
import useJwtStore from "@/store/jwtStore";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";
import { PortfolioCardProps } from "../api/portfolio";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    Title,
    CategoryScale,
    LineController,
    Tooltip,
    Legend,
} from "chart.js";
  
ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    TimeScale,
    CategoryScale,
    LineController,
    Title,
    Tooltip,
    Legend
);

interface ChartProps {
    portfolios: PortfolioCardProps[];
}

export default function Chart({ portfolios }: ChartProps) {
    const { getToken } = useJwtStore();
    const [error, setError] = useState("");
    const timeframes = ["1W", "2W", "1M", "3M", "6M", "1Y", "2Y", "5Y", "10Y", "YTD", "MAX", "Custom Date"];
    const [selectedTimeframe, setSelectedTimeframe] = useState("1W");
    const [dataPoints, setDataPoints] = useState<
      { label: string; data: { x: string; y: number }[]; borderColor: string }[]
    >([]);
  
    useEffect(() => {
        if (!portfolios || portfolios.length === 0) return;
        getDataPoints();
    }, [selectedTimeframe, portfolios]);
  
    const getDataPoints = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const token = getToken();
      if (!token) {
        setError("User is not authenticated");
        return;
      }
  
      try {
        const points: {
          label: string;
          data: { x: string; y: number }[];
          borderColor: string;
        }[] = [];
  
        for (let i = 0; i < portfolios.length; i++) {
          const response = await fetch(`${backendUrl}/portfolio/${portfolios[i].portfolioId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch portfolios");
          }
  
          const graphData = filterPointsWithTimeframe(data.performance_graph);
          points.push({
            label: portfolios[i].name,
            data: graphData,
            borderColor: portfolios[i].color,
          });
        }
  
        setDataPoints(points);
      } catch (err: any) {
        console.error("Error fetching portfolios", err);
        setError(err.message || "An error occurred while fetching portfolios");
      }
    };
  
    const filterPointsWithTimeframe = (points: any[]) => {
      const filteredPoints: { x: string; y: number }[] = [];
      const now = new Date();
      const timeframeDaysMap: Record<string, number> = {
        "1W": 7,
        "2W": 14,
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "1Y": 365,
        "2Y": 730,
        "5Y": 1825,
        "10Y": 3650,
      };
  
      const days = timeframeDaysMap[selectedTimeframe];
      const cutoffDate = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
  
      for (let i = 0; i < points.length; i++) {
        const time = new Date(points[i].snapshot_time);
        if (!cutoffDate || time >= cutoffDate) {
          filteredPoints.push({
            x: points[i].snapshot_time,
            y: Number(points[i].snapshot_value),
          });
        }
      }
  
      return filteredPoints;
    };
  
    const lineChartData = {
      datasets: dataPoints,
    };

    const getTimeUnit = (timeframe: string): 'day' | 'week' | 'month' | 'year' => {
        switch (timeframe) {
          case '1W':
          case '2W':
            return 'day';
          case '1M':
          case '3M':
              return 'week';
          case '6M':
          case '1Y':
          case '2Y':
          case 'YTD':
          case 'MAX':
            return 'month';
          case '5Y':
          case '10Y':
            return 'year';
          default:
            return 'day'; // fallback
        }
    };  

    const options: any = {
        responsive: true,
        scales: {
          x: {
            type: "time",
            time: {
              unit: getTimeUnit(selectedTimeframe),
              tooltipFormat: "PP", // optional: customize tooltip format
            },
            title: {
              display: false,
              text: "Date",
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (val: number) => `$${val}`,
            },
            title: {
              display: false,
              text: "Portfolio Value",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}`,
            },
          },
        },
    };
      
  
    return (
      <div className="p-4 pb-2 w-full">
        <header className="flex justify-between font-mono divide-x-2 whitespace-nowrap *:flex-1 *:px-4 *:py-[0.125rem] *:cursor-pointer *:border-evergray-400 text-evergray-700">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={
                timeframe === selectedTimeframe
                  ? "text-evergreen-500 relative after:content-[''] after:rounded-[1.5rem_1.5rem_0_0] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-3/5 after:h-1/5 after:bg-evergreen-500 transition after:transition"
                  : "hover:bg-evergray-200 transition"
              }
            >
              {timeframe}
            </button>
          ))}
        </header>
  
        <div className="py-4 w-full [&_canvas]:!w-[99%] [&_canvas]:!pb-4">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Line data={lineChartData} options={options} />
          )}
        </div>
      </div>
    );
}
  