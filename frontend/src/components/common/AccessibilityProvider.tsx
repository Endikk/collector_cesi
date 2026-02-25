'use client';

import React, { useEffect } from 'react';
import { FocusManager } from '@/lib/accessibility';

/**
 * Accessibility Provider - Initializes global a11y features
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize focus management
    FocusManager.init();
    
    // Add skip link styles if not present
    if (!document.getElementById('skip-link-styles')) {
      const style = document.createElement('style');
      style.id = 'skip-link-styles';
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .sr-only:focus,
        .sr-only:active {
          position: static;
          width: auto;
          height: auto;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
        
        /* Focus visible styles */
        body.focus-visible *:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        
        body:not(.focus-visible) *:focus {
          outline: none;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          * {
            border-color: currentColor !important;
          }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  return <>{children}</>;
}
