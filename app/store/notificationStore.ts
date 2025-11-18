import { create } from "zustand";

interface NotificationState {
	message: string | null;
	setMessage: (message: string) => void;
	clearMessage: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
	message: null,
	setMessage: (message) => set({ message }),
	clearMessage: () => set({ message: null }),
}));
