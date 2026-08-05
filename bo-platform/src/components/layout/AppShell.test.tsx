import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

const renderAppShell = (path = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <AuthProvider>
          <AppShell>
            <div data-testid="content">Test Content</div>
          </AppShell>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('AppShell', () => {
  it('renders children content', () => {
    renderAppShell();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders sidebar navigation with logo and links', () => {
    renderAppShell();
    expect(screen.getByText('HyperBench')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Algorithm Explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Experiment Repo/i })).toBeInTheDocument();
  });

  it('renders profile and settings links', () => {
    renderAppShell();
    expect(screen.getByRole('link', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderAppShell();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('renders topbar with search input', () => {
    renderAppShell();
    expect(screen.getByPlaceholderText(/Search experiments/i)).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    renderAppShell();
    expect(screen.getByRole('button', { name: /Switch to (light|dark) mode/i })).toBeInTheDocument();
  });

  it('renders notification toggle button', () => {
    renderAppShell();
    expect(screen.getByRole('button', { name: /Toggle notifications/i })).toBeInTheDocument();
  });

  it('toggles notifications panel on click', () => {
    renderAppShell();
    const notifButton = screen.getByRole('button', { name: /Toggle notifications/i });
    fireEvent.click(notifButton);
    expect(screen.getByText(/No new notifications/i)).toBeInTheDocument();
  });

  it('renders breadcrumb navigation', () => {
    renderAppShell();
    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument();
  });

  it('highlights active navigation item based on current path', () => {
    renderAppShell('/algorithms');
    const algoLink = screen.getByRole('link', { name: /Algorithm Explorer/i });
    expect(algoLink).toHaveClass('bg-[var(--color-glass-active)]');
  });

  it('collapses sidebar on button click', () => {
    renderAppShell();
    const collapseButton = screen.getByRole('button', { name: /Collapse/i });
    fireEvent.click(collapseButton);
    expect(screen.queryByText('Collapse')).not.toBeInTheDocument();
  });

  it('renders search input with placeholder text', () => {
    renderAppShell();
    const searchInput = screen.getByPlaceholderText(/Search experiments, datasets, algorithms/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders main content area', () => {
    renderAppShell();
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });
});