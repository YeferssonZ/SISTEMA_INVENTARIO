import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import type { Customer } from '../types';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  darkMode?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  darkMode = true
}) => {
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    rfc: customer?.rfc || '',
    street: customer?.street || '',
    city: customer?.city || '',
    state: customer?.state || '',
    zipCode: customer?.zipCode || '',
    customerType: customer?.customerType || 'individual',
    companyName: customer?.companyName || '',
    notes: customer?.notes || '',
    isActive: customer?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validación más flexible para teléfono peruano (acepta códigos de país y formatos variados)
    if (formData.phone) {
      const phoneNumbers = formData.phone.replace(/\D/g, ''); // Solo números
      if (phoneNumbers.length < 9 || phoneNumbers.length > 15) {
        newErrors.phone = 'El teléfono debe tener entre 9 y 15 dígitos';
      }
    }

    // Validación más flexible para RFC/RUC peruano (11 dígitos para RUC, o formato RFC mexicano)
    if (formData.rfc) {
      const rfc = formData.rfc.trim().toUpperCase();
      const isPeruvianRUC = /^\d{11}$/.test(rfc); // RUC peruano: 11 dígitos
      const isMexicanRFC = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/.test(rfc); // RFC mexicano
      const isGenericTaxID = /^[A-Z0-9]{8,13}$/.test(rfc); // ID fiscal genérico
      
      if (!isPeruvianRUC && !isMexicanRFC && !isGenericTaxID) {
        newErrors.rfc = 'El RUC/RFC debe tener un formato válido (11 dígitos para RUC peruano o formato RFC mexicano)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        rfc: formData.rfc.trim().toUpperCase() || null,
        street: formData.street.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null,
        customerType: formData.customerType,
        companyName: formData.companyName.trim() || null,
        notes: formData.notes.trim() || null,
        isActive: formData.isActive
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Nombre *"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Apellido *"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            placeholder="+51 987654321 o 987654321"
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="RUC/RFC"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            error={errors.rfc}
            disabled={isLoading}
            placeholder="20123456789 (RUC) o XAXX010101000 (RFC)"
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Código Postal"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            error={errors.zipCode}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Ciudad"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>

        <div>
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            error={errors.state}
            disabled={isLoading}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Tipo de Cliente
          </label>
          <select
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
            disabled={isLoading}
          >
            <option value="individual">Individual</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>

        {formData.customerType === 'empresa' && (
          <div>
            <Input
              label="Nombre de la Empresa"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              disabled={isLoading}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Dirección (Calle)
        </label>
        <textarea
          name="street"
          value={formData.street}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Notas
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
          disabled={isLoading}
          placeholder="Información adicional del cliente"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
          }`}
          disabled={isLoading}
        />
        <label htmlFor="isActive" className={`ml-2 block text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Cliente activo
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          darkMode={darkMode}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          darkMode={darkMode}
        >
          {isLoading ? 'Guardando...' : (customer ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
};
