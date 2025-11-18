import { create } from "zustand";

interface ModalState {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel?: () => void;
	confirmText?: string;
	cancelText?: string;
	showModal: (params: {
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel?: () => void;
		confirmText?: string;
		cancelText?: string;
	}) => void;
	hideModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
	isOpen: false,
	title: "",
	message: "",
	onConfirm: () => {},
	onCancel: undefined,
	confirmText: "OK",
	cancelText: "キャンセル",
	showModal: ({
		title,
		message,
		onConfirm,
		onCancel,
		confirmText,
		cancelText,
	}) =>
		set({
			isOpen: true,
			title,
			message,
			onConfirm,
			onCancel,
			confirmText: confirmText || "確認",
			cancelText: cancelText || "キャンセル",
		}),
	hideModal: () =>
		set({
			isOpen: false,
			title: "",
			message: "",
			onConfirm: () => {},
			onCancel: undefined,
		}),
}));
