import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Play, Box, Activity, Sliders, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const BENCHMARK_PROBLEMS = [
  {
    id: 'ackley',
    name: 'Ackley Function',
    category: 'Synthetic',
    dimensionality: '2-100D',
    constraints: 'Box constraints [-32.768, 32.768]',
    objective: 'Minimization',
    description: 'A widely used multimodal test function with a large number of local minima.',
    tags: ['Continuous', 'Multimodal', 'Non-separable']
  },
  {
    id: 'rosenbrock',
    name: 'Rosenbrock Function',
    category: 'Synthetic',
    dimensionality: '2-100D',
    constraints: 'Box constraints [-5, 10]',
    objective: 'Minimization',
    description: 'A non-convex function introduced by Howard H. Rosenbrock, also known as the Valley or Banana function.',
    tags: ['Continuous', 'Unimodal', 'Non-separable']
  },
  {
    id: 'xgb-tuning',
    name: 'XGBoost Hyperparameter Tuning',
    category: 'Real-world',
    dimensionality: '6D',
    constraints: 'Mixed (Categorical, Integer, Continuous)',
    objective: 'Maximization (Accuracy/F1)',
    description: 'Optimizing learning rate, max depth, n_estimators, and other parameters for XGBoost on standard tabular datasets.',
    tags: ['Mixed-integer', 'Machine Learning', 'Expensive']
  },
  {
    id: 'branin',
    name: 'Branin Function',
    category: 'Synthetic',
    dimensionality: '2D',
    constraints: 'x1 in [-5, 10], x2 in [0, 15]',
    objective: 'Minimization',
    description: 'A common 2D test function for optimization with three global minima.',
    tags: ['Continuous', 'Multimodal', 'Low-dimensional']
  },
  {
    id: 'hartmann6',
    name: 'Hartmann-6 Function',
    category: 'Synthetic',
    dimensionality: '6D',
    constraints: 'Box constraints [0, 1]',
    objective: 'Minimization',
    description: 'A 6-dimensional multimodal function with 6 local minima and one global minimum.',
    tags: ['Continuous', 'Multimodal']
  },
  {
    id: 'nn-architecture',
    name: 'Neural Network Architecture Search',
    category: 'Real-world',
    dimensionality: '15D',
    constraints: 'Categorical and Integer',
    objective: 'Maximization (Validation Accuracy)',
    description: 'Searching for optimal layer sizes, activation functions, and dropout rates for a deep neural network.',
    tags: ['Categorical', 'Deep Learning', 'Expensive']
  }
];

export default function BenchmarkLibrary() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredProblems = BENCHMARK_PROBLEMS.filter(problem => {
    const matchesSearch = problem.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || problem.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-ink">Benchmark Library</h1>
          <p className="mt-2 text-ink/70 text-lg">Explore and run standard optimization benchmark problems.</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
            <input
              type="text"
              placeholder="Search benchmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface/50 backdrop-blur-sm border border-ink/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-ink"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-surface/50 backdrop-blur-sm border border-ink/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-ink appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Synthetic">Synthetic</option>
              <option value="Real-world">Real-world</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem, idx) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface/60 backdrop-blur-md rounded-2xl border border-ink/5 p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-accent/10 rounded-xl">
                  {problem.category === 'Synthetic' ? <Activity className="w-6 h-6 text-accent" /> : <Box className="w-6 h-6 text-accent" />}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${problem.category === 'Synthetic' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'}`}>
                  {problem.category}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-ink mb-2">{problem.name}</h3>
              <p className="text-ink/70 text-sm mb-4 flex-grow">{problem.description}</p>
              
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center text-ink/80">
                  <Sliders className="w-4 h-4 mr-2 opacity-70" />
                  <span className="font-medium mr-2">Dim:</span> {problem.dimensionality}
                </div>
                <div className="flex items-center text-ink/80">
                  <Target className="w-4 h-4 mr-2 opacity-70" />
                  <span className="font-medium mr-2">Obj:</span> {problem.objective}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {problem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-ink/5 rounded-md text-xs text-ink/70 border border-ink/5">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => navigate(`/experiment/new?benchmark=${problem.id}`)}
                className="w-full py-3 px-4 bg-ink text-canvas rounded-xl font-medium flex items-center justify-center hover:bg-ink/90 transition-colors group mt-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Benchmark
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
