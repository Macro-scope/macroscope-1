import { useMemo } from 'react';
import { Theme } from '@glideapps/glide-data-grid';

export const useGridTheme = () => {
  return useMemo<Partial<Theme>>(
    () => ({
      accentColor: '#4285F4',
      accentLight: '#E8F0FE',
      textDark: '#202124',
      textMedium: '#5F6368',
      textLight: '#FFFFFF',
      bgCell: '#FFFFFF',
      bgCellMedium: '#F1F3F4',
      bgHeader: '#F8F9FA',
      bgHeaderHasFocus: '#E8F0FE',
      bgHeaderHovered: '#F1F3F4',
      borderColor: '#DADCE0',
      drilldownBorder: '#DADCE0',
      linkColor: '#1A73E8',
      cellHorizontalPadding: 12,
      cellVerticalPadding: 8,
      headerFontStyle: '600 13px',
      baseFontStyle: '14px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    }),
    []
  );
};
