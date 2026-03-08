/**
 * Input Validator Component
 * Provides real-time visual validation feedback with debouncing
 * Uses render props pattern for flexible integration
 */

import { useState, useEffect, ReactNode } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ValidationResult } from '../utils/validation';

interface ValidationRule {
  name: string;
  validate: (value: string) => ValidationResult;
}

interface InputValidatorProps {
  value: string;
  validationRules: ValidationRule[];
  debounceMs?: number;
  showValidation?: boolean;
  children: (props: ValidationRenderProps) => ReactNode;
}

export interface ValidationRenderProps {
  isValid: boolean;
  isInvalid: boolean;
  errors: string[];
  borderColor: string;
  icon: ReactNode;
}

interface ValidationState {
  isValid: boolean;
  isInvalid: boolean;
  errors: string[];
}

/**
 * Custom hook for debouncing values
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function InputValidator({
  value,
  validationRules,
  debounceMs = 300,
  showValidation = true,
  children
}: InputValidatorProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    isInvalid: false,
    errors: []
  });

  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (!debouncedValue || !showValidation) {
      setValidationState({ isValid: false, isInvalid: false, errors: [] });
      return;
    }

    const errors: string[] = [];

    for (const rule of validationRules) {
      const result = rule.validate(debouncedValue);
      if (!result.isValid && result.error) {
        errors.push(result.error);
      }
    }

    setValidationState({
      isValid: errors.length === 0,
      isInvalid: errors.length > 0,
      errors
    });
  }, [debouncedValue, validationRules, showValidation]);

  const renderProps: ValidationRenderProps = {
    ...validationState,
    borderColor: validationState.isValid
      ? 'border-green-500'
      : validationState.isInvalid
        ? 'border-red-500'
        : 'border-slate-200',
    icon: validationState.isValid
      ? <CheckCircle className="text-green-500 w-5 h-5" />
      : validationState.isInvalid
        ? <XCircle className="text-red-500 w-5 h-5" />
        : null
  };

  return <>{children(renderProps)}</>;
}
