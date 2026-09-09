'use client';

import {useEffect} from 'react';
import {loadShadowfallPack} from '../lib/loadShadowfallAssets';

/**
 * Warms the GLB cache without making asset availability a hard dependency.
 * The gameplay runtime can continue using its procedural renderer until every
 * authored asset has been generated and validated.
 */
export default function ShadowfallAssetPreloader() {
  useEffect(() => {
    let cancelled = false;

    loadShadowfallPack()
      .then(() => {
        if (!cancelled) document.documentElement.dataset.shadowfallAssets = 'ready';
      })
      .catch(() => {
        // Missing GLBs are expected before the Blender asset build has run.
        // Keep the game playable with its existing procedural fallback.
        if (!cancelled) document.documentElement.dataset.shadowfallAssets = 'fallback';
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
