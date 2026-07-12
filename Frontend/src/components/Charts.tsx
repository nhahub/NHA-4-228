import React from 'react';
import { TuningResponse } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  ChartData
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components for Radar
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartJSTooltip,
  ChartJSLegend
);

interface ChartsProps {
  results: TuningResponse | null;
  t: any;
  lang: 'en' | 'ar';
}

export const Charts: React.FC<ChartsProps> = ({ results, t, lang }) => {
  if (!results) return null;

  const { stock, modified } = results;

  // --- 1. Recharts Bar Chart Data ---
  // Side-by-side comparison of normalized metrics or absolute metrics.
  // To avoid huge differences (e.g. 240 Top Speed vs 7.5 Acceleration), we can display them as percentage improvements or in a multi-series format.
  // A clean way is to display three tabs or normalized metrics where Stock is 100% and Modified is shown relative to 100%.
  // Or we can just present HP, Torque, Top Speed side-by-side, or use normalized scores (0 to 100).
  // Let's create absolute comparison bars for:
  // - HP & Torque (grouped)
  // - Acceleration (individual, smaller values)
  // - Top Speed (individual, larger values)
  // Let's render a grouped Recharts bar chart for Horsepower and Torque.
  const powerData = [
    {
      name: t.horsepower,
      [t.stock]: stock.horsepower,
      [t.modified]: modified.horsepower
    },
    {
      name: t.torque,
      [t.stock]: stock.torque,
      [t.modified]: modified.torque
    }
  ];

  // --- 2. Chart.js Radar Chart Data ---
  // We want to map:
  // - Speed (Stock Top Speed vs Modified Top Speed, normalized to 500 max)
  // - Acceleration Score (e.g. 20 - acceleration, so lower accel time is higher on radar, normalized)
  // - Power (HP, normalized to 1000 max)
  // - Torque (Torque, normalized to 1000 max)
  // - Fuel Score (e.g. 25 - fuelConsumption, so lower consumption is higher score, normalized)
  
  // Normalization logic (scale 0 - 100)
  const normHP = (hp: number) => Math.min(100, (hp / 800) * 100);
  const normTorque = (trq: number) => Math.min(100, (trq / 800) * 100);
  const normSpeed = (spd: number) => Math.min(100, (spd / 400) * 100);
  // Accel: 15s -> 0, 2s -> 100. Formula: (15 - accel) / 13 * 100
  const normAccel = (acc: number) => Math.min(100, Math.max(0, ((15 - acc) / 13) * 100));
  // Fuel: 20L -> 0, 4L -> 100. Formula: (20 - fuel) / 16 * 100
  const normFuel = (fl: number) => Math.min(100, Math.max(0, ((20 - fl) / 16) * 100));

  const radarLabels = [
    t.horsepower,
    t.torque,
    t.topSpeed,
    t.accel,
    t.fuel
  ];

  const radarData: ChartData<'radar'> = {
    labels: radarLabels,
    datasets: [
      {
        label: t.stock,
        data: [
          normHP(stock.horsepower),
          normTorque(stock.torque),
          normSpeed(stock.topSpeed),
          normAccel(stock.acceleration),
          normFuel(stock.fuelConsumption)
        ],
        backgroundColor: 'rgba(255, 85, 0, 0.2)',
        borderColor: '#ff5500',
        borderWidth: 2,
        pointBackgroundColor: '#ff5500',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ff5500'
      },
      {
        label: t.modified,
        data: [
          normHP(modified.horsepower),
          normTorque(modified.torque),
          normSpeed(modified.topSpeed),
          normAccel(modified.acceleration),
          normFuel(modified.fuelConsumption)
        ],
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        borderColor: '#00f0ff',
        borderWidth: 2,
        pointBackgroundColor: '#00f0ff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00f0ff'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#f5f5f7',
          font: {
            family: lang === 'ar' ? 'Cairo' : 'Outfit',
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || '';
            const value = Math.round(context.raw);
            return `${datasetLabel}: ${value}% rating`;
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        pointLabels: {
          color: '#9ea0a8',
          font: {
            family: lang === 'ar' ? 'Cairo' : 'Outfit',
            size: 11
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#5e6066',
          font: {
            size: 9
          },
          stepSize: 20
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="chart-panel-grid">
      {/* 1. Bar Chart Card */}
      <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '380px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {t.horsepower} & {t.torque} {t.difference}
        </h3>
        <div style={{ flex: 1, width: '100%', minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={powerData}
              margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                stroke="#9ea0a8" 
                tick={{ fill: '#9ea0a8', fontSize: 12, fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit' }}
              />
              <YAxis 
                stroke="#9ea0a8" 
                tick={{ fill: '#9ea0a8', fontSize: 11 }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#13131c',
                  borderColor: 'rgba(255,255,255,0.1)',
                  color: '#f5f5f7',
                  fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit',
                  borderRadius: '8px'
                }}
              />
              <RechartsLegend 
                wrapperStyle={{
                  paddingTop: 10,
                  fontSize: 12,
                  fontFamily: lang === 'ar' ? 'Cairo' : 'Outfit'
                }}
              />
              <Bar dataKey={t.stock} fill="#ff5500" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t.modified} fill="#00f0ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Radar Chart Card */}
      <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '380px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {lang === 'ar' ? 'ملف أداء السيارة الشامل' : 'Overall Performance Profile'}
        </h3>
        <div style={{ flex: 1, width: '100%', minHeight: '280px', position: 'relative' }}>
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>
    </div>
  );
};
