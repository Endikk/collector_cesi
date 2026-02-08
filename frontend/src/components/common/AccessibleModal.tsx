'use client';

import React, { useEffect, useRef } from 'react';
import { trapFocus } from '@/lib/accessibility';
import { useTranslations } from '@/lib/i18n/LocaleProvider';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
  description,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    // Trap focus within modal
    const cleanup = trapFocus(modalRef.current);
    
    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ✕
          </button>
        </div>
        
        {description && (
          <p id="modal-description" className="sr-only">
            {description}
          </p>
        )}
        
        <div>{children}</div>
      </div>
    </div>
  );
}
