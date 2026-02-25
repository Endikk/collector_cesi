import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Test du composant Button ────────────────────────────────────
const { Button } = require('@/components/ui/button');

describe('Button Component', () => {
  it('renders with default variant and text', () => {
    render(React.createElement(Button, null, 'Acheter'));
    const button = screen.getByRole('button', { name: /acheter/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-variant', 'default');
  });

  it('renders with destructive variant', () => {
    render(React.createElement(Button, { variant: 'destructive' }, 'Supprimer'));
    const button = screen.getByRole('button', { name: /supprimer/i });
    expect(button).toHaveAttribute('data-variant', 'destructive');
  });

  it('renders disabled state correctly', () => {
    render(React.createElement(Button, { disabled: true }, 'Désactivé'));
    const button = screen.getByRole('button', { name: /désactivé/i });
    expect(button).toBeDisabled();
  });

  it('renders different sizes', () => {
    render(React.createElement(Button, { size: 'lg' }, 'Grand'));
    const button = screen.getByRole('button', { name: /grand/i });
    expect(button).toHaveAttribute('data-size', 'lg');
  });
});

// ─── Test du composant Badge ─────────────────────────────────────
const { Badge } = require('@/components/ui/badge');

describe('Badge Component', () => {
  it('renders with text content', () => {
    render(React.createElement(Badge, null, 'En vente'));
    expect(screen.getByText('En vente')).toBeInTheDocument();
  });

  it('renders with secondary variant', () => {
    render(React.createElement(Badge, { variant: 'secondary' }, 'Occasion'));
    const badge = screen.getByText('Occasion');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[data-slot="badge"]')).toBeTruthy();
  });

  it('renders with outline variant', () => {
    render(React.createElement(Badge, { variant: 'outline' }, 'Neuf'));
    expect(screen.getByText('Neuf')).toBeInTheDocument();
  });
});
