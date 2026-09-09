import * as THREE from 'three';
import {cloneShadowfallAsset,type ShadowfallAsset} from './loadShadowfallAssets';

type VisualEnemy={g:THREE.Group;type:string};
type AssetPack=Record<'player'|'stalker'|'caster'|'brute'|'boss'|'arena',ShadowfallAsset>;

/** Replace only render children; gameplay-facing groups and state remain untouched. */
export function applyShadowfallAuthoredVisuals(args:{
  scene:THREE.Scene;
  player:THREE.Group;
  playerShadow:THREE.Object3D;
  floor:THREE.Object3D;
  grid:THREE.Object3D;
  enemies:VisualEnemy[];
  pack:AssetPack;
}){
  const {scene,player,playerShadow,floor,grid,enemies,pack}=args;

  player.children.forEach(child=>{
    if(child!==playerShadow)child.visible=false;
  });
  player.add(cloneShadowfallAsset(pack.player));

  floor.visible=false;
  grid.visible=false;
  scene.add(cloneShadowfallAsset(pack.arena));

  const authoredByType={
    stalker:pack.stalker,
    caster:pack.caster,
    brute:pack.brute,
    boss:pack.boss,
  } as const;

  enemies.forEach(enemy=>{
    const asset=authoredByType[enemy.type as keyof typeof authoredByType];
    if(!asset)return;
    enemy.g.children.forEach(child=>{child.visible=false});
    enemy.g.add(cloneShadowfallAsset(asset));
  });
}
