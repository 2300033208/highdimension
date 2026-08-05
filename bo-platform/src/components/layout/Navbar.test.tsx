import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';
import { renderWithProviders } from '../../test/test-utils';

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo link and brand name', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /HyperBench Home/i })).toBeInTheDocument();
    expect(screen.getByText('HyperBench')).toBeInTheDocument();
  });

  it('renders main navigation links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Algorithms/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Research/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /About Us/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contact/i })).toBeInTheDocument();
  });

  it('renders sign in and register CTA buttons', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toBeInTheDocument();
  });

  it('opens mobile menu on toggle and closes it again', () => {
    renderWithProviders(<Navbar />);
    const toggle = screen.getByRole('button', { name: /Open navigation menu/i });
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: /Mobile navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close navigation menu/i }));
    expect(screen.queryByRole('navigation', { name: /Mobile navigation/i })).not.toBeInTheDocument();
  });

  it('calls onSectionClick for section links', () => {
    const onSectionClick = vi.fn();
    renderWithProviders(<Navbar onSectionClick={onSectionClick} />);
    fireEvent.click(screen.getByRole('button', { name: /How It Works/i }));
    expect(onSectionClick).toHaveBeenCalledWith('how-it-works');
  });

  it('does not call onSectionClick for Home link (allows navigation)', () => {
    const onSectionClick = vi.fn();
    renderWithProviders(<Navbar onSectionClick={onSectionClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Home/i }));
    expect(onSectionClick).not.toHaveBeenCalled();
  });

  it('calls onSectionClick for algorithm section link', () => {
    const onSectionClick = vi.fn();
    renderWithProviders(<Navbar onSectionClick={onSectionClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Algorithms/i }));
    expect(onSectionClick).toHaveBeenCalledWith('algorithms');
  });

  it('marks active section with aria-current', () => {
    renderWithProviders(<Navbar activeSection="algorithms" />);
    expect(screen.getByRole('button', { name: /Algorithms/i })).toHaveAttribute('aria-current', 'page');
  });

  it('marks Home as current when no active section', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('button', { name: /Home/i })).toHaveAttribute('aria-current', 'page');
  });
});
