import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  showModal: (params: { title: string; message: string; onConfirm: () => void; confirmText?: string }) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
  confirmText: 'OK',
  showModal: ({ title, message, onConfirm, confirmText }) =>
    set({ isOpen: true, title, message, onConfirm, confirmText }),
  hideModal: () => set({ isOpen: false, title: '', message: '', onConfirm: () => {} }),
}));