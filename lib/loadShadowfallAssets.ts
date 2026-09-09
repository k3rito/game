import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {shadowfallAssets,type ShadowfallAssetName} from './assetManifest';

export type ShadowfallAsset={scene:THREE.Group;animations:THREE.AnimationClip[]};

const cache=new Map<string,Promise<ShadowfallAsset>>();
const loader=new GLTFLoader();

function load(url:string){
  const cached=cache.get(url);
  if(cached)return cached;
  const promise=new Promise<ShadowfallAsset>((resolve,reject)=>{
    loader.load(url,gltf=>resolve({scene:gltf.scene,animations:gltf.animations}),undefined,reject);
  });
  cache.set(url,promise);
  return promise;
}

export function loadShadowfallAsset(name:ShadowfallAssetName){
  return load(shadowfallAssets[name]);
}

export async function loadShadowfallPack(names:ShadowfallAssetName[]=['player','stalker','caster','brute','boss','arena']){
  const entries=await Promise.all(names.map(async name=>[name,await loadShadowfallAsset(name)] as const));
  return Object.fromEntries(entries) as Record<ShadowfallAssetName,ShadowfallAsset>;
}

export function cloneShadowfallAsset(asset:ShadowfallAsset){
  const clone=asset.scene.clone(true);
  clone.traverse(object=>{
    const mesh=object as THREE.Mesh;
    if(mesh.isMesh){
      mesh.castShadow=true;
      mesh.receiveShadow=true;
      if(mesh.material)mesh.material=(Array.isArray(mesh.material)?mesh.material.map(m=>m.clone()):mesh.material.clone());
    }
  });
  return clone;
}
