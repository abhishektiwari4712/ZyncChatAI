// src/components/ThemeSelector.jsx
import React, { useState, useEffect } from 'react';
import { PaletteIcon } from 'lucide-react';
import { THEMES } from '../constants/index.js';
import useThemeStore from '../store/useThemeStore.js';
import './ThemeSelector.css';

const ThemeSelector = () => {
  const { theme, setTheme, initTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize theme on component mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleSelect = (themeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <button
        className="icon-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select Theme"
      >
        <PaletteIcon className="icon" />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="theme-list">
            {THEMES.map((themeOption) => (
              <button
                key={themeOption.name}
                className={`theme-button ${theme === themeOption.name ? 'active' : ''}`}
                onClick={() => handleSelect(themeOption.name)}
              >
                <PaletteIcon className="theme-icon" />
                <span className="theme-label">{themeOption.label}</span>

                <div className="theme-colors">
                  {themeOption.colors.map((color, i) => (
                    <span
                      key={i}
                      className="theme-dot"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;