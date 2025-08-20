import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  darkMode?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  darkMode = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
          darkMode 
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
        } ${
          error 
            ? (darkMode ? 'border-red-400' : 'border-red-500') 
            : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className={`mt-1 text-sm ${
          darkMode ? 'text-red-400' : 'text-red-600'
        }`}>{error}</p>
      )}
    </div>
  );
};

export { Input };
