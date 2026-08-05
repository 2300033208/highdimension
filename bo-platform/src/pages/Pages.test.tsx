import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import Admin from './Admin';
import AlgorithmDetail from './AlgorithmDetail';
import AlgorithmExplorer from './AlgorithmExplorer';
import BenchmarkAnalytics from './BenchmarkAnalytics';
import BenchmarkDashboard from './BenchmarkDashboard';
import BenchmarkLibrary from './BenchmarkLibrary';
import Documentation from './Documentation';
import ExperimentConfig from './ExperimentConfig';
import ExperimentRepository from './ExperimentRepository';
import ForgotPassword from './ForgotPassword';
import OtpVerification from './OtpVerification';
import Profile from './Profile';
import Recommendation from './Recommendation';
import RecommendationInsights from './RecommendationInsights';
import Register from './Register';
import Reports from './Reports';
import ResearchInsights from './ResearchInsights';
import ResetPassword from './ResetPassword';
import Settings from './Settings';
import Visualisations from './Visualisations';

const pages = [
  { name: 'Admin', component: Admin },
  { name: 'AlgorithmDetail', component: AlgorithmDetail },
  { name: 'AlgorithmExplorer', component: AlgorithmExplorer },
  { name: 'BenchmarkAnalytics', component: BenchmarkAnalytics },
  { name: 'BenchmarkDashboard', component: BenchmarkDashboard },
  { name: 'BenchmarkLibrary', component: BenchmarkLibrary },
  { name: 'Documentation', component: Documentation },
  { name: 'ExperimentConfig', component: ExperimentConfig },
  { name: 'ExperimentRepository', component: ExperimentRepository },
  { name: 'ForgotPassword', component: ForgotPassword },
  { name: 'OtpVerification', component: OtpVerification },
  { name: 'Profile', component: Profile },
  { name: 'Recommendation', component: Recommendation },
  { name: 'RecommendationInsights', component: RecommendationInsights },
  { name: 'Register', component: Register },
  { name: 'Reports', component: Reports },
  { name: 'ResearchInsights', component: ResearchInsights },
  { name: 'ResetPassword', component: ResetPassword },
  { name: 'Settings', component: Settings },
  { name: 'Visualisations', component: Visualisations },
];

describe('Page smoke tests', () => {
  pages.forEach(({ name, component }) => {
    it(`renders ${name} page`, () => {
      const { container } = renderWithProviders(<component />);
      expect(container).toBeTruthy();
    });
  });
});