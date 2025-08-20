import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  darkMode?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  darkMode = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className={`rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>{title}</h2>
          <Button
            variant="outline"
            size="sm"
            darkMode={darkMode}
            onClick={onClose}
            className={`${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ✕
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
