import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthShell } from './AuthShell';

describe('AuthShell', () => {
  it('renders children content', () => {
    render(
      <MemoryRouter>
        <AuthShell>
          <div>Login Form</div>
        </AuthShell>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Form')).toBeInTheDocument();
  });

  it('renders without error when title is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthShell title="Sign In">
          <div>Sign In</div>
        </AuthShell>
      </MemoryRouter>
    );
    expect(container).toBeInTheDocument();
  });

  it('navigates to home on Escape key press', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<AuthShell><div>Login</div></AuthShell>} />
          <Route path="/" element={<div data-testid="home">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('navigates to home when backdrop is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<AuthShell><div>Login</div></AuthShell>} />
          <Route path="/" element={<div data-testid="home">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const backdrop = screen.getByText('Login').closest('.min-h-screen');
    fireEvent.click(backdrop!);
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('does not navigate when inner content is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<AuthShell><div data-testid="content">Login Content</div></AuthShell>} />
          <Route path="/" element={<div data-testid="home">Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('content'));
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByTestId('home')).not.toBeInTheDocument();
  });
});