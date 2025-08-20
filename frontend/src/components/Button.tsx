import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  darkMode = false,
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: darkMode 
      ? 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 focus:ring-offset-gray-800'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    outline: darkMode
      ? 'border border-gray-600 hover:bg-gray-700 text-gray-300 focus:ring-gray-500 focus:ring-offset-gray-800'
      : 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
