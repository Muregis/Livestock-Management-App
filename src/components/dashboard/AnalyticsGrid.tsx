import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Activity,
  Users,
  TrendingUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Milk,
  Beef,
  Thermometer,
  Scale,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Simulated real-time data updates
const generateRandomValue = (base: number, variance: number) => {
  return Math.round(base + (Math.random() - 0.5) * variance);
};

const updateMilkData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((name) => ({
    name,
    value: generateRandomValue(2600, 600),
  }));
};

const updateFeedData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((name) => ({
    name,
    value: generateRandomValue(475, 50),
  }));
};

const updateWeightData = () => {
  return Array.from({ length: 6 }, (_, i) => ({
    name: String(i + 1),
    holstein: generateRandomValue(660, 40),
    jersey: generateRandomValue(460, 30),
    angus: generateRandomValue(760, 50),
  }));
};

interface AnalyticsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  chart?: React.ReactNode;
  details?: {
    label: string;
    value: string;
  }[];
  onRefresh?: () => void;
  className?: string;
}

const AnalyticsCard = ({
  title,
  value,
  icon,
  trend,
  chart,
  details,
  onRefresh,
  className = "",
}: AnalyticsCardProps) => {
  return (
    <Card
      className={`bg-white hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-100"
              onClick={onRefresh}
            >
              <Activity className="h-4 w-4" />
            </Button>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={`flex items-center space-x-1 text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>

        {details && (
          <div className="mt-4 space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {chart && (
          <div className="mt-4 h-[80px] transition-all duration-300">
            {chart}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsGrid = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [milkProductionData, setMilkProductionData] =
    useState(updateMilkData());
  const [feedConsumptionData, setFeedConsumptionData] =
    useState(updateFeedData());
  const [weightData, setWeightData] = useState(updateWeightData());
  const [metrics, setMetrics] = useState({
    milkProduction: {
      value: "2,845 L",
      trend: { value: 12, isPositive: true },
    },
    feedConsumption: { value: "475 kg", trend: { value: 5, isPositive: true } },
    herdHealth: { value: "96%", trend: { value: 2, isPositive: true } },
    averageWeight: { value: "650 kg", trend: { value: 8, isPositive: true } },
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        milkProduction: {
          value: `${generateRandomValue(2800, 100)} L`,
          trend: {
            value: generateRandomValue(10, 5),
            isPositive: Math.random() > 0.3,
          },
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshMilk = () => {
    setMilkProductionData(updateMilkData());
    setMetrics((prev) => ({
      ...prev,
      milkProduction: {
        value: `${generateRandomValue(2800, 100)} L`,
        trend: {
          value: generateRandomValue(10, 5),
          isPositive: Math.random() > 0.3,
        },
      },
    }));
  };

  const handleRefreshFeed = () => {
    setFeedConsumptionData(updateFeedData());
    setMetrics((prev) => ({
      ...prev,
      feedConsumption: {
        value: `${generateRandomValue(470, 20)} kg`,
        trend: {
          value: generateRandomValue(5, 3),
          isPositive: Math.random() > 0.3,
        },
      },
    }));
  };

  const handleRefreshWeight = () => {
    setWeightData(updateWeightData());
    setMetrics((prev) => ({
      ...prev,
      averageWeight: {
        value: `${generateRandomValue(650, 30)} kg`,
        trend: {
          value: generateRandomValue(8, 4),
          isPositive: Math.random() > 0.3,
        },
      },
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          className="min-w-0"
          title="Daily Milk Production"
          value={metrics.milkProduction.value}
          icon={<Milk className="h-4 w-4 text-blue-600" />}
          trend={metrics.milkProduction.trend}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={milkProductionData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#93c5fd"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="text-sm">{`${payload[0].value} L`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          }
          details={[
            { label: "Morning", value: "1,245 L" },
            { label: "Evening", value: "1,600 L" },
          ]}
          onRefresh={handleRefreshMilk}
        />
        <AnalyticsCard
          className="min-w-0"
          title="Feed Consumption"
          value={metrics.feedConsumption.value}
          icon={<Scale className="h-4 w-4 text-green-600" />}
          trend={metrics.feedConsumption.trend}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedConsumptionData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="text-sm">{`${payload[0].value} kg`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
          details={[
            { label: "Hay", value: "285 kg" },
            { label: "Grain", value: "190 kg" },
          ]}
          onRefresh={handleRefreshFeed}
        />
        <AnalyticsCard
          className="min-w-0"
          title="Herd Health Score"
          value={metrics.herdHealth.value}
          icon={<Thermometer className="h-4 w-4 text-red-600" />}
          trend={metrics.herdHealth.trend}
          details={[
            { label: "Healthy", value: "142" },
            { label: "Under Watch", value: "8" },
          ]}
        />
        <AnalyticsCard
          className="min-w-0"
          title="Average Weight"
          value={metrics.averageWeight.value}
          icon={<Beef className="h-4 w-4 text-purple-600" />}
          trend={metrics.averageWeight.trend}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightData}>
                <Bar dataKey="holstein" stackId="a" fill="#9333ea" />
                <Bar dataKey="jersey" stackId="a" fill="#a855f7" />
                <Bar dataKey="angus" stackId="a" fill="#c084fc" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          {payload.map((entry) => (
                            <p
                              key={entry.name}
                              className="text-sm"
                              style={{ color: entry.color }}
                            >
                              {`${entry.name}: ${entry.value} kg`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          }
          details={[
            { label: "Holstein", value: "680 kg" },
            { label: "Jersey", value: "475 kg" },
          ]}
          onRefresh={handleRefreshWeight}
        />
      </div>

      <Card className="bg-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Milk Production Trends</h3>
            <p className="text-sm text-muted-foreground">
              Daily milk yield per cow breed
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={milkProductionData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-sm">
                        <p className="font-medium">{payload[0].payload.name}</p>
                        <p className="text-sm text-blue-600">
                          {`${payload[0].value} L`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorMilk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsGrid;
