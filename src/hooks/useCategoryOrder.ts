import { create } from 'zustand';

const STORAGE_KEY = 'testkit:category-order';

function loadOrder(): string[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveOrder(order: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

interface CategoryOrderState {
  customOrder: string[] | null;
  getOrder: (defaultOrder: string[]) => string[];
  setOrder: (order: string[]) => void;
  resetOrder: () => void;
}

export const useCategoryOrder = create<CategoryOrderState>((set, get) => ({
  customOrder: loadOrder(),
  getOrder: (defaultOrder: string[]) => get().customOrder ?? defaultOrder,
  setOrder: (order: string[]) => {
    saveOrder(order);
    set({ customOrder: order });
  },
  resetOrder: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ customOrder: null });
  },
}));
