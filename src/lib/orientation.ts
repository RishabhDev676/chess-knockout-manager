'use client';

import { useState, useEffect } from 'react';

export type ViewOrientation = 'vertical' | 'horizontal-tree' | 'compact-grid';
export type ScreenOrientationType = 'portrait' | 'landscape';

/**
 * Custom hook to track window screen orientation (portrait vs landscape)
 * and responsive screen size width.
 */
export function useScreenOrientation(): {
  orientation: ScreenOrientationType;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const [screenInfo, setScreenInfo] = useState<{
    orientation: ScreenOrientationType;
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  }>({
    orientation: 'portrait',
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isLandscape = window.matchMedia('(orientation: landscape)').matches || w > h;

      setScreenInfo({
        orientation: isLandscape ? 'landscape' : 'portrait',
        width: w,
        height: h,
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return screenInfo;
}

/**
 * Calculates optimal match card column layout for a given screen width and board count.
 */
export function calculateGridColumns(
  width: number,
  boardCount: number,
  viewMode: ViewOrientation
): string {
  if (viewMode === 'compact-grid') {
    if (width < 640) return 'grid-cols-2';
    if (width < 1024) return 'grid-cols-3';
    return 'grid-cols-4 lg:grid-cols-6';
  }

  if (viewMode === 'vertical') {
    if (width < 768) return 'grid-cols-1';
    if (width < 1280) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  }

  return 'grid-cols-1';
}

/**
 * Recommends default view mode based on screen orientation and player count
 */
export function getRecommendedViewMode(
  orientation: ScreenOrientationType,
  width: number,
  matchCount: number
): ViewOrientation {
  if (matchCount > 16) {
    return 'compact-grid';
  }
  if (orientation === 'landscape' && width >= 768) {
    return 'horizontal-tree';
  }
  return 'vertical';
}
