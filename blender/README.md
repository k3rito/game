# Shadowfall Blender pipeline

The runtime is a Next.js + Three.js application. Blender is now the authored-asset source while Three.js remains responsible for gameplay, simulation, camera control and effects.

## Current asset set

The generator exports:

- `public/assets/3d/player.glb`
- `public/assets/3d/enemy-stalker.glb`
- `public/assets/3d/enemy-caster.glb`
- `public/assets/3d/enemy-brute.glb`
- `public/assets/3d/enemy-boss.glb`
- `public/assets/3d/arena.glb`

## Local generation

From the repository root:

```text
blender --background --python blender/generate_shadowfall_assets.py
blender --background --python blender/validate_shadowfall_assets.py
```

The validation command exits non-zero if an asset is missing, cannot be imported, contains no meshes, has invalid transforms/materials, or has implausible dimensions.

## Runtime integration

`lib/loadShadowfallAssets.ts` owns GLB loading and caching. `lib/applyShadowfallAuthoredVisuals.ts` swaps only visual children, preserving the existing gameplay-facing `THREE.Group` objects, positions, HP, AI, hit detection and combat state.

The procedural renderer remains the fallback. If authored assets fail to load, the game continues using its existing procedural visuals rather than failing the scene.

The app shell also preloads the asset pack without blocking the page. The runtime integration is guarded by `scripts/integrate-shadowfall-assets.mjs`; it refuses to modify `app/page.tsx` unless the expected source anchors are present.

## CI pipeline

`.github/workflows/shadowfall-assets.yml` automatically:

1. installs Blender,
2. generates the GLBs,
3. validates them,
4. applies the guarded runtime integration,
5. commits generated assets and the runtime change.

`.github/workflows/web-build.yml` then verifies the Next.js production build after web-facing changes.

## Pipeline rule

Do not delete the procedural fallback until the authored asset path has passed generation, validation, production build and browser verification. Asset origin, orientation, scale, material setup and runtime loading must remain deterministic.
