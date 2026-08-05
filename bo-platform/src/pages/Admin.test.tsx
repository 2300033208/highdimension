import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Admin from './Admin';
import { renderWithProviders } from '../test/test-utils';

describe('Admin', () => {
  it('renders admin dashboard heading and description', () => {
    renderWithProviders(<Admin />);

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/manage users, experiments, and platform overview/i)).toBeInTheDocument();
  });

  it('renders metric cards with labels', () => {
    renderWithProviders(<Admin />);

    expect(screen.getByText(/total users/i)).toBeInTheDocument();
    expect(screen.getByText(/total experiments/i)).toBeInTheDocument();
  });

  it('renders users and experiments tabs', () => {
    renderWithProviders(<Admin />);

    expect(screen.getByRole('button', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /experiments/i })).toBeInTheDocument();
  });
});