import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ThemeStore = create(
  persist(
    (set, get) => ({
      theme: "coffee",
      setTheme: (themeName) => {
        // Apply theme to document
        const html = document.documentElement;
        html.setAttribute('data-theme', themeName);
        
        // Update store
        set({ theme: themeName });
        
        // Store in localStorage as backup
        localStorage.setItem('theme', themeName);
      },
      
      // Initialize theme on app start
      initTheme: () => {
        const html = document.documentElement;
        const currentTheme = get().theme;
        html.setAttribute('data-theme', currentTheme);
      }
    }),
    {
      name: 'theme-storage', // unique name for localStorage key
    }
  )
)

export default ThemeStore;