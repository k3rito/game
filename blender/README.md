# Shadowfall Blender pipeline

The game runtime is currently a Next.js + Three.js application. The latest runtime pass already has the complete combat loop, 34 stages, 120-node skill system, bosses, projectiles, VFX, audio, responsive HUD and mobile controls.

This directory is the next asset-authoring layer discussed for the project: Blender becomes the source of authored 3D geometry while Three.js remains responsible for runtime, gameplay and camera control.

## Generate the first authored asset set

Open the project in Blender 4.x and run:

```text
blender --background --python blender/generate_shadowfall_assets.py
```

The script exports:

- `public/assets/3d/player.glb`
- `public/assets/3d/enemy-stalker.glb`
- `public/assets/3d/enemy-caster.glb`
- `public/assets/3d/enemy-brute.glb`
- `public/assets/3d/arena.glb`

The runtime deliberately keeps its procedural models as a safe fallback until the GLB loading layer is enabled and the exported assets have passed visual/runtime checks.

## Pipeline rule

Do not delete the procedural fallback when replacing an asset. Each authored GLB must first be validated for scale, origin, orientation, materials, triangle budget and runtime loading. This prevents a bad Blender export from making the game unplayable.
