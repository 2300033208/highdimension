import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import Dashboard from './Dashboard';
import Landing from './Landing';
import NotFound from './NotFound';

describe('Page smoke tests', () => {
  it('renders Dashboard page', () => {
    const { container } = renderWithProviders(<Dashboard />);
    expect(container).toBeTruthy();
  });

  it('renders Landing page', () => {
    const { container } = renderWithProviders(<Landing />);
    expect(container).toBeTruthy();
  });

  it('renders 404 page', () => {
    const { container } = renderWithProviders(<NotFound />);
    expect(container).toBeTruthy();
  });
});