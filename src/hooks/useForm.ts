'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { z, ZodSchema } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find((e) => e.path[0] === field);
        if (fieldError) {
          setErrors((prev) => ({ ...prev, [field]: fieldError.message }));
          return false;
        }
      }
      return true;
    }
  }, [validationSchema, values]);

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors<T> = {};
        error.errors.forEach((e) => {
          const field = e.path[0] as keyof T;
          if (!newErrors[field]) {
            newErrors[field] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues((prev) => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name as keyof T);
  }, [validateField]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as { [K in keyof T]: boolean }
    );
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
}
