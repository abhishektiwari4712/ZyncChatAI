// src/components/LanguageBadge.jsx
import React from 'react';
import './LanguageBadge.css';

const LanguageBadge = ({ language, type, className = "" }) => {
  // Safe language handling
  const safeLanguage = language || 'unknown';
  const displayLanguage = safeLanguage.charAt(0).toUpperCase() + safeLanguage.slice(1);
  
  const getLanguageFlag = (lang) => {
    const flags = {
      english: '🇬🇧',
      hindi: '🇮🇳',
      spanish: '🇪🇸',
      french: '🇫🇷',
      german: '🇩🇪',
      japanese: '🇯🇵',
      chinese: '🇨🇳',
      korean: '🇰🇷',
      unknown: '🏳️'
    };
    return flags[lang.toLowerCase()] || '🏳️';
  };

  return (
    <span className={`badge ${className}`}>
      {getLanguageFlag(safeLanguage)} {type}: {displayLanguage}
    </span>
  );
};

export default LanguageBadge;
