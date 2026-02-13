import { toast, ToastOptions, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const showSuccess = (message: string | React.ReactNode, options: ToastOptions = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showError = (message: string | React.ReactNode, options: ToastOptions = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showInfo = (message: string | React.ReactNode, options: ToastOptions = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showWarning = (message: string | React.ReactNode, options: ToastOptions = {}) => {
  toast.warn(message, { ...defaultOptions, ...options });
};

export const showLoading = (message: string | React.ReactNode, options: ToastOptions = {}): Id => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

export const dismissToast = (toastId: Id) => {
  toast.dismiss(toastId);
};