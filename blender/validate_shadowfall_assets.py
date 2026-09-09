"""Lightweight Blender-side validation for exported Shadowfall GLBs.

Run after generate_shadowfall_assets.py. The script checks object counts,
finite transforms, approximate playable scale and missing materials.
"""
import bpy
import math
import os
import sys

ASSET_DIR=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', '3d'))
FILES=['player.glb','enemy-stalker.glb','enemy-caster.glb','enemy-brute.glb','enemy-boss.glb','arena.glb']


def finite(v):
    return all(math.isfinite(float(x)) for x in v)


def validate(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not os.path.exists(path):
        return False, ['missing file']
    try:
        bpy.ops.import_scene.gltf(filepath=path)
    except Exception as exc:
        return False, [f'import failed: {exc}']
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
    issues=[]
    if not objects:
        issues.append('no mesh objects')
    for o in objects:
        if not finite(o.location) or not finite(o.scale):
            issues.append(f'non-finite transform: {o.name}')
        if any(m is None for m in o.data.materials):
            issues.append(f'missing material: {o.name}')
        if o.dimensions.length>1000:
            issues.append(f'implausible dimensions: {o.name}')
    return not issues, issues


failed=False
for filename in FILES:
    ok, issues=validate(os.path.join(ASSET_DIR, filename))
    print(('PASS' if ok else 'FAIL'), filename, '; '.join(issues))
    failed |= not ok

if failed:
    sys.exit(1)
