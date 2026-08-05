import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Calendar, Filter, Activity, CheckCircle, Clock, Database, TrendingUp, Target } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default function BenchmarkAnalytics() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30d');
  
  // Try to use actual experiments from auth user, fallback to mock statistics for dashboard layout
  const experiments = user?.experiments || [];
  
  const totalBenchmarks = experiments.length > 0 ? experiments.length : 124;
  const successRate = 92;
  const averageObjective = -14.52;
  
  const monthlyTrendsData = [
    { name: 'Jan', runs: 12, success: 10 },
    { name: 'Feb', runs: 19, success: 18 },
    { name: 'Mar', runs: 15, success: 14 },
    { name: 'Apr', runs: 22, success: 21 },
    { name: 'May', runs: 30, success: 28 },
    { name: 'Jun', runs: 26, success: 23 },
  ];

  const datasetDistributionData = [
    { name: 'Ackley', value: 35 },
    { name: 'Rosenbrock', value: 25 },
    { name: 'XGBoost', value: 20 },
    { name: 'Branin', value: 10 },
    { name: 'Other', value: 10 },
  ];

  const performanceData = [
    { iteration: 10, best_val: -2.4 },
    { iteration: 20, best_val: -5.1 },
    { iteration: 30, best_val: -8.9 },
    { iteration: 40, best_val: -12.3 },
    { iteration: 50, best_val: -14.1 },
    { iteration: 60, best_val: -14.4 },
    { iteration: 70, best_val: -14.5 },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold text-ink">Benchmark Analytics</h1>
            <p className="mt-1 text-ink/70">Performance metrics and optimization insights.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 bg-surface/50 backdrop-blur-md p-1.5 rounded-xl border border-ink/10"
          >
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range 
                    ? 'bg-ink text-canvas shadow-sm' 
                    : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                }`}
              >
                {range}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Benchmarks" 
            value={totalBenchmarks} 
            icon={<Database className="w-5 h-5 text-blue-500" />} 
            trend="+12%" 
            delay={0.1} 
          />
          <StatCard 
            title="Success Rate" 
            value={`${successRate}%`} 
            icon={<CheckCircle className="w-5 h-5 text-green-500" />} 
            trend="+2.1%" 
            delay={0.2} 
          />
          <StatCard 
            title="Avg. Objective" 
            value={averageObjective} 
            icon={<Target className="w-5 h-5 text-purple-500" />} 
            trend="-1.4" 
            delay={0.3} 
          />
          <StatCard 
            title="Avg. Runtime" 
            value="45s" 
            icon={<Clock className="w-5 h-5 text-orange-500" />} 
            trend="-5s" 
            delay={0.4} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-surface/60 backdrop-blur-md rounded-2xl border border-ink/5 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-ink mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-accent" />
              Optimization Performance Profile
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="iteration" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="best_val" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-surface/60 backdrop-blur-md rounded-2xl border border-ink/5 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-ink mb-6">Benchmark Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datasetDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {datasetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-3 bg-surface/60 backdrop-blur-md rounded-2xl border border-ink/5 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-ink mb-6">Monthly Activity Trends</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.5)', fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="runs" name="Total Runs" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="success" name="Successful Runs" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon, trend, delay }: { title: string, value: string | number, icon: React.ReactNode, trend: string, delay: number }) {
  const isPositive = trend.startsWith('+');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface/60 backdrop-blur-md rounded-2xl border border-ink/5 p-6 shadow-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-ink/5 rounded-xl">
          {icon}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          isPositive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
        }`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm text-ink/60 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-ink">{value}</h3>
      </div>
    </motion.div>
  );
}
