import React from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  darkMode?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  darkMode = true
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const variantClasses = {
    danger: darkMode ? 'text-red-400' : 'text-red-600',
    warning: darkMode ? 'text-yellow-400' : 'text-yellow-600',
    info: darkMode ? 'text-blue-400' : 'text-blue-600'
  };

  const iconVariants = {
    danger: '⚠️',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className={`rounded-lg shadow-xl w-full max-w-md ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white'
      }`}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`text-2xl mr-3 ${variantClasses[variant]}`}>
              {iconVariants[variant]}
            </div>
            <h3 className={`text-lg font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h3>
          </div>
          
          <p className={`text-sm mb-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message}
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              darkMode={darkMode}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              darkMode={darkMode}
              className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoading ? 'Procesando...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
