"""Shadowfall Blender asset generator.

Run inside Blender 4.x:
    blender --background --python blender/generate_shadowfall_assets.py

Outputs GLB assets into public/assets/3d/. The web game keeps its procedural
fallback until these authored assets are present, so the asset pass is safe to
apply incrementally.
"""
import bpy
import math
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "public", "assets", "3d")
os.makedirs(OUT, exist_ok=True)


def clear():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def mat(name, color, metallic=0.0, roughness=0.45, emission=None):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1.0)
    bs.inputs['Metallic'].default_value = metallic
    bs.inputs['Roughness'].default_value = roughness
    if emission:
        bs.inputs['Emission Color'].default_value = (*emission, 1.0)
        bs.inputs['Emission Strength'].default_value = 3.0
    return m


STEEL = mat('Shadow Steel', (0.34, 0.41, 0.55), .85, .22)
DARK = mat('Obsidian', (0.025, 0.035, 0.065), .9, .16)
WHITE = mat('Blade Alloy', (.72, .82, .98), .9, .13)
GOLD = mat('Royal Gold', (.75, .48, .08), .9, .2)
VOID = mat('Void Energy', (.35, .18, 1.0), .15, .24, (.35, .18, 1.0))
CRIMSON = mat('Enemy Crimson', (.72, .08, .22), .35, .35, (.32, .015, .04))
TEAL = mat('Enemy Teal', (.04, .55, .52), .35, .35, (.02, .28, .26))


def apply_mat(obj, material):
    obj.data.materials.append(material)
    return obj


def primitive(kind, name, loc, scale, material, **kwargs):
    getattr(bpy.ops.mesh, f'primitive_{kind}_add')(location=loc, **kwargs)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    apply_mat(o, material)
    return o


def player():
    root = bpy.data.objects.new('SF_Player', None)
    bpy.context.collection.objects.link(root)
    for obj in [
        primitive('capsule', 'Body', (0, 0, 1.02), (.43, .43, .52), STEEL, vertices=16, radius=1, depth=1),
        primitive('cube', 'ChestArmor', (0, .03, 1.25), (.38, .22, .24), STEEL),
        primitive('uv_sphere', 'Helm', (0, 0, 1.86), (.45, .45, .38), DARK, segments=20, ring_count=12),
        primitive('cube', 'Visor', (0, -.42, 1.91), (.19, .035, .035), VOID),
    ]:
        obj.parent = root
    for x in (-.46, .46):
        primitive('uv_sphere', 'Shoulder', (x, 0, 1.37), (.19, .19, .19), STEEL, segments=12, ring_count=8).parent = root
    for x in (-.21, .21):
        primitive('cube', 'Boot', (x, 0, .28), (.12, .16, .18), DARK).parent = root
    primitive('cube', 'SwordGuard', (.70, 0, 1.70), (.18, .05, .06), GOLD).parent = root
    blade = primitive('cube', 'SwordBlade', (.70, 0, 1.03), (.055, .045, .78), WHITE)
    blade.rotation_euler.z = math.radians(-27)
    blade.parent = root
    return root


def enemy(name, material, brute=False):
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    if brute:
        primitive('ico_sphere', 'Core', (0, 0, .72), (.72, .72, .72), material, subdivisions=2).parent = root
        for x in (-.42, .42):
            horn = primitive('cone', 'Horn', (x, 0, 1.12), (.17, .17, .38), DARK, vertices=8, radius1=1, radius2=0, depth=1)
            horn.rotation_euler.y = x * .35
            horn.parent = root
    else:
        primitive('ico_sphere', 'Core', (0, 0, .62), (.55, .55, .55), material, subdivisions=2).parent = root
        for x in (-1, 1):
            fin = primitive('cone', 'Fin', (x*.43, 0, .68), (.10, .10, .36), material, vertices=6, radius1=1, radius2=0, depth=1)
            fin.rotation_euler.y = x * .8
            fin.parent = root
    return root


def arena():
    root = bpy.data.objects.new('SF_Arena_Module', None)
    bpy.context.collection.objects.link(root)
    primitive('cube', 'Floor', (0, 0, -.12), (17, 13, .12), DARK).parent = root
    for x in (-16.8, 16.8):
        primitive('cube', 'Wall', (x, 0, 2.0), (.20, 13, 2.0), STEEL).parent = root
    for y in (-12.8, 12.8):
        primitive('cube', 'Wall', (0, y, 2.0), (17, .20, 2.0), STEEL).parent = root
    for x in (-10, 10):
        for y in (-7, 7):
            primitive('cylinder', 'Pillar', (x, y, 1.2), (.55, .55, 1.2), STEEL, vertices=12, radius=1, depth=2.4).parent = root
    return root


def export(root, filename):
    bpy.ops.object.select_all(action='DESELECT')
    root.select_set(True)
    for child in root.children_recursive:
        child.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, filename), export_format='GLB', use_selection=True, export_apply=True)


def main():
    clear(); export(player(), 'player.glb')
    clear(); export(enemy('SF_Stalker', CRIMSON), 'enemy-stalker.glb')
    clear(); export(enemy('SF_Caster', TEAL), 'enemy-caster.glb')
    clear(); export(enemy('SF_Brute', CRIMSON, brute=True), 'enemy-brute.glb')
    clear(); export(arena(), 'arena.glb')
    print('Shadowfall Blender assets exported to', OUT)


if __name__ == '__main__':
    main()
