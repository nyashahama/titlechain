import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    success: (message: string, description?: string) =>
      sonnerToast.success(message, { description }),
    error: (message: string, description?: string) =>
      sonnerToast.error(message, { description }),
    info: (message: string, description?: string) =>
      sonnerToast.info(message, { description }),
    loading: (message: string) => sonnerToast.loading(message),
    dismiss: (id: string | number) => sonnerToast.dismiss(id),
  };
}
