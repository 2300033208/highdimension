import '@testing-library/jest-dom';
import { vi, expect } from 'vitest';

// Mock localStorage with actual storage
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_BASE_URL: 'http://localhost:8081/api/v1',
    VITE_PYTHON_ENGINE_URL: 'http://localhost:8000',
    VITE_ADMIN_EMAIL: 'admin@test.local',
    VITE_ADMIN_PASSWORD: 'testpassword',
  },
});