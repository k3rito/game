import fs from 'node:fs';

const path = 'app/page.tsx';
const source = fs.readFileSync(path, 'utf8');
const marker = '// SHADOWFALL_AUTHORED_ASSETS';

if (source.includes(marker)) {
  console.log('Authored asset integration already present.');
  process.exit(0);
}

const importNeedle = "import {effectLabel,skills,stages,type SkillEffect} from '../lib/gameData';";
const importReplacement = `${importNeedle}\nimport {cloneShadowfallAsset,loadShadowfallPack} from '../lib/loadShadowfallAssets';`;
if (!source.includes(importNeedle)) {
  throw new Error('Cannot locate gameData import anchor; refusing to modify app/page.tsx.');
}

const spawnNeedle = "for(let i=0;i<Math.min(16,cfg.enemies);i++)makeEnemy(i);if(cfg.boss)makeEnemy(99,true);";
const spawnReplacement = `${spawnNeedle}
 // SHADOWFALL_AUTHORED_ASSETS
 loadShadowfallPack().then(pack=>{
   if(!el.isConnected)return;
   // Keep simulation-facing groups intact; only swap their visual children.
   player.children.forEach(child=>{if(child!==playerShadow)child.visible=false});
   const authoredPlayer=cloneShadowfallAsset(pack.player);
   player.add(authoredPlayer);

   floor.visible=false;
   grid.visible=false;
   scene.add(cloneShadowfallAsset(pack.arena));

   const authoredByType={stalker:pack.stalker,caster:pack.caster,brute:pack.brute,boss:pack.boss};
   enemies.forEach(enemy=>{
     const asset=authoredByType[enemy.type as keyof typeof authoredByType];
     if(!asset)return;
     enemy.g.children.forEach(child=>{child.visible=false});
     enemy.g.add(cloneShadowfallAsset(asset));
   });
 }).catch(()=>{
   // Asset generation is optional at runtime. Existing procedural visuals remain active.
 });`;
if (!source.includes(spawnNeedle)) {
  throw new Error('Cannot locate enemy spawn anchor; refusing to modify app/page.tsx.');
}

let output = source.replace(importNeedle, importReplacement).replace(spawnNeedle, spawnReplacement);
fs.writeFileSync(path, output);
console.log('Integrated validated Shadowfall GLB visuals with procedural fallback.');
