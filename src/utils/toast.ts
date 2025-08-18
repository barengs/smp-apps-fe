import { toast, ToastOptions, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export const showSuccess = (message: string, options: ToastOptions = {}) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showError = (message: string, options: ToastOptions = {}) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showInfo = (message: string, options: ToastOptions = {}) => {
  toast.info(message, { ...defaultOptions, ...options });
};

export const showWarning = (message: string, options: ToastOptions = {}) => {
  toast.warn(message, { ...defaultOptions, ...options });
};

export const showLoading = (message: string, options: ToastOptions = {}): Id => {
  return toast.loading(message, { ...defaultOptions, ...options });
};

export const dismissToast = (toastId: Id) => {
  toast.dismiss(toastId);
};