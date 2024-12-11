import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast Container wrapper with consistent styling
export const ToastProvider = ({ children }:any) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="truncate"
      />
    </>
  );
};

// Custom hook for consistent toast usage
export const useToast = () => {
  const showToast = {
    success: (message:string) =>
      toast.success(message, {
        // icon: '✅',
        className: 'bg-white text-green-800',
        progressClassName: 'bg-green-500',
      }),

    error: (message:string) =>
      toast.error(message, {
        // icon: '❌',
        className: 'bg-white text-red-800',
        progressClassName: 'bg-red-500',
      }),

    warning: (message:string) =>
      toast.warning(message, {
        // icon: '⚠️',
        className: 'bg-white text-yellow-800',
        progressClassName: 'bg-yellow-500',
      }),

    info: (message:string) =>
      toast.info(message, {
        // icon: 'i',
        className: 'bg-white text-blue-800',
        progressClassName: 'bg-blue-500',
      }),

    // For custom configurations
    custom: (message:string, options = {}) => toast(message, options),
  };

  return showToast;
};

export default ToastProvider;