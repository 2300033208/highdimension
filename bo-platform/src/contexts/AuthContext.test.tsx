import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Test wrapper component
function TestComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@test.com', 'password')} data-testid="login-btn">Login</button>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start unauthenticated with no user', () => {
      render(<TestComponent />, { wrapper: TestWrapper });
      expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('no-user');
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      // Mock successful login response
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: { token: 'fake-jwt-token' }
        })
      });

      // Mock /users/me response
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: {
            id: 1,
            email: 'test@test.com',
            name: 'Test User',
            institution: 'Test Inst',
            role: 'user',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'Active',
            experiments: [],
            datasets: [],
            problemStatements: [],
            reports: []
          }
        })
      });

      render(<TestComponent />, { wrapper: TestWrapper });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
      });

      expect(screen.getByTestId('user-email').textContent).toBe('test@test.com');
    });

    it('should handle login failure', async () => {
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 401,
          message: 'Invalid credentials'
        })
      });

      render(<TestComponent />, { wrapper: TestWrapper });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
      });
    });
  });

  describe('logout', () => {
    it('should clear user and token on logout', async () => {
      // Use login to authenticate instead of relying on initial auth check
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: { token: 'fake-jwt-token' }
        })
      });

      // Mock /users/me response for login
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          data: {
            id: 1,
            email: 'test@test.com',
            name: 'Test User',
            institution: 'Test Inst',
            role: 'user',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            status: 'Active',
            experiments: [],
            datasets: [],
            problemStatements: [],
            reports: []
          }
        })
      });

      render(<TestComponent />, { wrapper: TestWrapper });

      // Login using the test component's login function
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      // Wait for authentication to complete
      await waitFor(() => {
        expect(screen.getByTestId('user-email').textContent).toBe('test@test.com');
      }, { timeout: 5000 });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
      expect(screen.getByTestId('user-email').textContent).toBe('no-user');
      expect(localStorage.getItem('hdbo_auth')).toBeNull();
    });
  });
});