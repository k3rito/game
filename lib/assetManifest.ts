export const ASSET_BASE='/assets/3d';

export const shadowfallAssets={
  player:`${ASSET_BASE}/player.glb`,
  stalker:`${ASSET_BASE}/enemy-stalker.glb`,
  caster:`${ASSET_BASE}/enemy-caster.glb`,
  brute:`${ASSET_BASE}/enemy-brute.glb`,
  arena:`${ASSET_BASE}/arena.glb`,
} as const;

export type ShadowfallAssetName=keyof typeof shadowfallAssets;
