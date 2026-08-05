import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import ExperimentConfig from './ExperimentConfig';

describe('ExperimentConfig', () => {
  it('renders experiment configuration page', () => {
    const { container } = renderWithProviders(<ExperimentConfig />);
    expect(container).toBeTruthy();
  });
});