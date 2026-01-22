import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseAsyncActionOptions {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

/**
 * Custom hook for handling async actions with loading state and error handling
 */
export function useAsyncAction<T extends (...args: Parameters<T>) => Promise<unknown>>(
    action: T,
    options: UseAsyncActionOptions = {}
) {
    const [loading, setLoading] = useState(false);

    const execute = useCallback(
        async (...args: Parameters<T>) => {
            setLoading(true);
            try {
                const result = await action(...args);
                if (options.successMessage) {
                    toast.success(options.successMessage);
                }
                options.onSuccess?.();
                return result;
            } catch (error) {
                console.error("Action failed:", error);
                if (options.errorMessage) {
                    toast.error(options.errorMessage);
                }
                options.onError?.(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [action, options]
    );

    return { execute, loading };
}

/**
 * Custom hook for modal state management
 */
export function useModal<T = undefined>() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | undefined>(undefined);

    const open = useCallback((modalData?: T) => {
        setData(modalData);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setData(undefined);
    }, []);

    return { isOpen, open, close, data };
}
