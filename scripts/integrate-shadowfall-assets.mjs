import fs from 'node:fs';

const path = 'app/page.tsx';
const source = fs.readFileSync(path, 'utf8');
const marker = '// SHADOWFALL_AUTHORED_ASSETS';

if (source.includes(marker)) {
  console.log('Authored asset integration already present.');
  process.exit(0);
}

const gameDataImport = "import {effectLabel,skills,stages,type SkillEffect} from '../lib/gameData';";
const importReplacement = `${gameDataImport}\nimport {applyShadowfallAuthoredVisuals} from '../lib/applyShadowfallAuthoredVisuals';\nimport {loadShadowfallPack} from '../lib/loadShadowfallAssets';`;
if (!source.includes(gameDataImport)) {
  throw new Error('Cannot locate gameData import anchor; refusing to modify app/page.tsx.');
}

const spawnNeedle = "for(let i=0;i<Math.min(16,cfg.enemies);i++)makeEnemy(i);if(cfg.boss)makeEnemy(99,true);";
const spawnReplacement = `${spawnNeedle}
 // SHADOWFALL_AUTHORED_ASSETS
 loadShadowfallPack().then(pack=>{
   if(!el.isConnected)return;
   applyShadowfallAuthoredVisuals({scene,player,playerShadow,floor,grid,enemies,pack});
 }).catch(()=>{
   // Asset generation is optional at runtime. Existing procedural visuals remain active.
 });`;
if (!source.includes(spawnNeedle)) {
  throw new Error('Cannot locate enemy spawn anchor; refusing to modify app/page.tsx.');
}

const output = source.replace(gameDataImport, importReplacement).replace(spawnNeedle, spawnReplacement);
fs.writeFileSync(path, output);
console.log('Integrated validated Shadowfall GLB visuals with procedural fallback.');
