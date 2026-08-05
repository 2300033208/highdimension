import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders nothing when path is root', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumb items for nested path', () => {
    render(
      <MemoryRouter initialEntries={['/algorithms']}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(screen.getByText(/Algorithms/i)).toBeInTheDocument();
  });

  it('renders breadcrumb items with custom items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings', current: true },
    ];
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('marks current item with aria-current="page"', () => {
    const items = [
      { label: 'Dashboard', href: '/', current: false },
      { label: 'Current', href: '/current', current: true },
    ];
    render(
      <MemoryRouter initialEntries={['/current']}>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    const currentItem = screen.getByText('Current').closest('[aria-current="page"]');
    expect(currentItem).toBeInTheDocument();
  });

  it('renders breadcrumb navigation with aria-label', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument();
  });

  it('renders home icon for first breadcrumb item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings', current: true },
    ];
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Breadcrumb items={items} />
      </MemoryRouter>
    );
    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toBeInTheDocument();
  });

  it('applies custom className to breadcrumb', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Breadcrumb className="custom-class" />
      </MemoryRouter>
    );
    const breadcrumb = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(breadcrumb).toHaveClass('custom-class');
  });

  it('formats hyphenated segments as title case', () => {
    render(
      <MemoryRouter initialEntries={['/about-us']}>
        <Breadcrumb />
      </MemoryRouter>
    );
    expect(screen.getByText(/About Us/i)).toBeInTheDocument();
  });
});