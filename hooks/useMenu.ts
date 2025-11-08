import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MenuState {
    shrinkMenu: boolean;
    setShrinkMenu: (shrink: boolean) => void;
    toggleShrinkMenu: () => void;
}

export const useMenuStore = create<MenuState>()(
    persist(
        (set, get) => ({
            shrinkMenu: false,
            setShrinkMenu: (shrink: boolean) => set({ shrinkMenu: shrink }),
            toggleShrinkMenu: () => set({ shrinkMenu: !get().shrinkMenu }),
        }),
        {
            name: 'menu-storage',
        }
    )
);

export const useMenu = () => {
    const { shrinkMenu, setShrinkMenu, toggleShrinkMenu } = useMenuStore();
    return { shrinkMenu, setShrinkMenu, toggleShrinkMenu };
};