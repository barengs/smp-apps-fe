import { toast, type Id } from "react-toastify";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showWarning = (message: string) => {
  toast.warn(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: Id) => {
  toast.dismiss(toastId);
};