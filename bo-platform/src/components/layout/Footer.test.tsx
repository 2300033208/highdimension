import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders footer columns and links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText('PLATFORM')).toBeInTheDocument();
    expect(screen.getByText('RESOURCES')).toBeInTheDocument();
    expect(screen.getByText('RESEARCH')).toBeInTheDocument();
    expect(screen.getByText('PROJECT')).toBeInTheDocument();
  });

  it('renders platform links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Benchmarks')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('renders research and resource links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Algorithms')).toBeInTheDocument();
    expect(screen.getByText('Publications')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
  });

  it('renders project links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText(/© 2026 HD-BO Bench/i)).toBeInTheDocument();
  });
});
