import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';


const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#24394b');scene.fog=new THREE.FogExp2('#253b4c',.004);
const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.1,240);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:new URLSearchParams(location.search).has('demo')});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;$('game').appendChild(renderer.domElement);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.36,.65,.82));
scene.add(new THREE.HemisphereLight('#a8c7e5','#42535c',1.95));const moon=new THREE.DirectionalLight('#c9e4ff',3.05);moon.position.set(-15,30,15);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);Object.assign(moon.shadow.camera,{left:-30,right:30,top:30,bottom:-30,far:90});moon.shadow.radius=4;moon.shadow.normalBias=.035;moon.shadow.bias=-.001;scene.add(moon);
let seed=8392;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const rr=(a,b)=>a+rand()*(b-a);
const tex=new THREE.TextureLoader().load(new URL('./assets/stone.png', import.meta.url).href);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1.3,1.3);tex.anisotropy=8;
const normalTex=new THREE.TextureLoader().load(new URL('./assets/stone-normal.png',import.meta.url).href);normalTex.wrapS=normalTex.wrapT=THREE.RepeatWrapping;normalTex.repeat.copy(tex.repeat);normalTex.anisotropy=8;
// The generated relief stays inside small, framed recesses.  It is a stone
// material, not a billboard: sRGB preserves the carved source while the shared
// normal map and high roughness keep it under the lantern and moonlight.
const carvedGateTex=new THREE.TextureLoader().load(new URL('./assets/carved-gate.png',import.meta.url).href);carvedGateTex.colorSpace=THREE.SRGBColorSpace;carvedGateTex.wrapS=carvedGateTex.wrapT=THREE.RepeatWrapping;carvedGateTex.repeat.set(1,1);carvedGateTex.anisotropy=8;
const stone=new THREE.MeshStandardMaterial({map:tex,color:'#a6adb0',normalMap:normalTex,normalScale:new THREE.Vector2(.55,.55),roughness:.72});const darkStone=new THREE.MeshStandardMaterial({map:tex,color:'#76818a',normalMap:normalTex,normalScale:new THREE.Vector2(.65,.65),roughness:.8});const trim=new THREE.MeshStandardMaterial({map:tex,color:'#b2b4b1',normalMap:normalTex,normalScale:new THREE.Vector2(.45,.45),roughness:.65});const floorMats=Array.from({length:7},(_,i)=>new THREE.MeshStandardMaterial({map:tex,color:new THREE.Color().setHSL(.57,.09,.31+i*.024),normalMap:normalTex,normalScale:new THREE.Vector2(.35,.35),roughness:.19,metalness:.38,envMapIntensity:1.1}));
const carvedRelief=new THREE.MeshStandardMaterial({map:carvedGateTex,color:'#879096',normalMap:normalTex,normalScale:new THREE.Vector2(.26,.26),roughness:.82,metalness:.02});
const black=new THREE.MeshStandardMaterial({color:'#090f18',roughness:.85});const bronze=new THREE.MeshStandardMaterial({color:'#9e7040',metalness:.7,roughness:.42});const gold=new THREE.MeshBasicMaterial({color:'#ffbd50'});const runeGlow=new THREE.MeshBasicMaterial({color:'#f6a64a',transparent:true,opacity:.72});const icyEye=new THREE.MeshBasicMaterial({color:'#69dcff',toneMapped:false});const moss=new THREE.MeshStandardMaterial({color:'#354234',roughness:1});const distantStone=new THREE.MeshBasicMaterial({color:'#263744',fog:true});const distantTrim=new THREE.MeshBasicMaterial({color:'#40525d',fog:true});
function mesh(g,m,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,x,y,z,m=stone,p=scene){return mesh(w>.2&&h>.12&&d>.2?new RoundedBoxGeometry(w,h,d,1,Math.min(.045,w*.07,h*.1,d*.07)):new THREE.BoxGeometry(w,h,d),m,x,y,z,p)}
function cylinder(r1,r2,h,x,y,z,m=stone,p=scene,n=10){return mesh(new THREE.CylinderGeometry(r1,r2,h,n),m,x,y,z,p)}
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const a=c.getContext('2d'),g=a.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,245,210,1)');g.addColorStop(.12,'rgba(255,194,77,.8)');g.addColorStop(.35,'rgba(255,140,34,.22)');g.addColorStop(1,'rgba(255,110,20,0)');a.fillStyle=g;a.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}const glowMap=glowTexture();
// Eye sprites have their own blue-white source.  Recoloring the amber lantern
// sprite left a warm residue under bloom, so this map stays cyan before tone
// mapping and makes the wraiths a clear cold counterpoint to every fire.
function eyeGlowTexture(){const c=document.createElement('canvas');c.width=c.height=96;const a=c.getContext('2d'),g=a.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,'rgba(235,253,255,1)');g.addColorStop(.16,'rgba(118,232,255,.96)');g.addColorStop(.4,'rgba(42,180,255,.36)');g.addColorStop(1,'rgba(0,126,255,0)');a.fillStyle=g;a.fillRect(0,0,96,96);return new THREE.CanvasTexture(c)}const eyeGlowMap=eyeGlowTexture();
// A pale alpha-only cloud used by wraiths and floor haze.  It gives the blue
// tint something soft to catch without introducing a downloaded texture.
function mistTexture(){const c=document.createElement('canvas');c.width=c.height=192;const a=c.getContext('2d');for(let i=0;i<18;i++){const x=35+((i*47)%121),y=40+((i*83)%105),r=20+(i%5)*9,g=a.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(235,247,255,.28)');g.addColorStop(.42,'rgba(210,232,250,.12)');g.addColorStop(1,'rgba(170,205,230,0)');a.fillStyle=g;a.fillRect(x-r,y-r,r*2,r*2)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}const mistMap=mistTexture();
function glow(x,y,z,size=2,p=scene){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.set(x,y,z);s.scale.set(size,size,size);p.add(s);return s}
const ground=box(32,1,40,0,-.7,0,darkStone);box(33,.28,41,0,-.15,0,trim);
// Individual worn flagstones, interrupted joints, and pools catching the sky.
const pavingTex=new THREE.TextureLoader().load(new URL('./assets/wet-flagstone.png',import.meta.url).href);pavingTex.colorSpace=THREE.SRGBColorSpace;pavingTex.wrapS=pavingTex.wrapT=THREE.RepeatWrapping;pavingTex.repeat.set(4,5);pavingTex.anisotropy=8;
const paving=new THREE.MeshStandardMaterial({map:pavingTex,normalMap:normalTex,normalScale:new THREE.Vector2(.23,.23),color:'#d1d0c9',roughness:.28,metalness:.09});
// Lift the wet flagstones without flattening their dark joints. Reflected sky
// and broken fire streaks share the stone texture, so they never read as decals.
paving.onBeforeCompile=shader=>{
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 wetGround;').replace('#include <begin_vertex>','#include <begin_vertex>\nwetGround=position.xy;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec2 wetGround;
// One material field drives the damp stone, standing-water sheen and reflected
// sky. This avoids coloured puddle overlays that float above the paving.
float wetField(vec2 p){
 float broad=sin(p.x*.53+sin(p.y*.37)*1.7)+sin(p.y*.79-p.x*.19)*.64;
 float edge=sin(p.x*4.7+p.y*2.1)*.13+sin(p.y*8.9-p.x*1.6)*.07;
 return smoothstep(-.30,.82,broad+edge);
}
float fireTrail(vec2 p,vec2 source){
 vec2 d=p-source;
 float lengthMask=smoothstep(-.5,.3,d.y)*(1.-smoothstep(1.,5.6,d.y));
 float bend=sin(d.y*5.7+source.x)*.12+sin(d.y*13.)*.05;
 float width=.24+.075*max(d.y,0.);
 return exp(-pow((d.x+bend)/width,2.))*lengthMask;
}`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 vec2 wetCoord=vec2(wetGround.x,-wetGround.y);
 float stoneWet=wetField(wetCoord);
 float jointGate=smoothstep(.035,.18,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)));
 float standingWater=stoneWet*jointGate;
 roughnessFactor=mix(roughnessFactor,.095,standingWater*.72);
`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
 metalnessFactor=mix(metalnessFactor,.26,standingWater*.42);
`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float stoneValue=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
 float naturalWet=wetField(vec2(wetGround.x,-wetGround.y))*smoothstep(.025,.15,stoneValue);
 diffuseColor.rgb=mix(diffuseColor.rgb,sqrt(max(diffuseColor.rgb,vec3(0.)))*.72,.64);
 diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.73,.82,.87),naturalWet*.20);
 vec2 ground=vec2(wetGround.x,-wetGround.y);
 float brokenSurface=.5+.5*sin(ground.y*12.+sin(ground.x*21.)*2.);
 float silver=naturalWet*(.32+.68*brokenSurface)*(1.-smoothstep(8.5,14.,abs(ground.x)));
 float amber=fireTrail(ground,vec2(-11.,11.))+fireTrail(ground,vec2(11.,11.))
 +fireTrail(ground,vec2(-11.,-8.))+fireTrail(ground,vec2(11.,-8.))
 +fireTrail(ground,vec2(-4.6,-12.8))+fireTrail(ground,vec2(4.6,-12.8))
 +fireTrail(ground,vec2(-14.,1.))+fireTrail(ground,vec2(14.,17.));
 amber*=smoothstep(.035,.19,stoneValue)*(.2+.8*brokenSurface);
`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 totalEmissiveRadiance+=vec3(.105,.16,.215)*silver+vec3(.48,.235,.065)*amber;
`);
};
const pavingFloor=mesh(new THREE.PlaneGeometry(32,40),paving,0,.067,0);pavingFloor.rotation.x=-Math.PI/2;
// Raised fragments break the flat surface along the ruined margins.
for(let i=0;i<130;i++){const x=(i%2?1:-1)*rr(8.8,15),z=rr(-19,20),q=box(rr(.3,1.2),.11,rr(.3,.9),x,.055,z,floorMats[3]);q.rotation.y=rr(-.7,.7)}
const obstacles=[];function pillar(x,z,h=6,w=1.1){box(w*1.5,.3,w*1.5,x,.25,z,trim);box(w*1.22,.26,w*1.22,x,.5,z);for(let y=.7;y<h;y+=.63){box(w,.6,w,x,y,z,y%2>1?darkStone:stone);box(.13,.58,.14,x-w*.49,y,z+w*.47,trim);box(.13,.58,.14,x+w*.49,y,z+w*.47,trim)}box(w*1.4,.24,w*1.4,x,h,z,trim);box(w*1.2,.18,w*1.2,x,h+.2,z);obstacles.push({x,z,r:w*.76})}
function arch(x,z,width,height,depth=.8,grand=false){const group=new THREE.Group();scene.add(group);let spring=height-width*.52;for(const side of [-1,1]){pillar(x+side*width*.5,z,spring,grand?1.3:.75)}for(let i=0;i<17;i++){const a=(i+.5)/17*Math.PI;const px=x+Math.cos(a)*width*.5,py=spring+Math.sin(a)*width*.57;const o=box(width*.105,.58,depth,px,py,z,i%3?stone:trim,group);o.rotation.z=a-Math.PI/2;if(grand){const q=box(.065,.26,.03,x+Math.cos(a)*(width*.5-.35),spring+Math.sin(a)*(width*.57-.3),z+depth*.51,gold,group);q.rotation.z=a-Math.PI/2}}return group}
// Monumental gate and fractured cloisters frame the play space.
const gateZ=-15;
// The portal reads as a broad, battered facade instead of a pair of identical towers.
// Its opening stays centred and clear for the win trigger, but its broken wings step
// back at different depths to give the horizon several architectural layers.
arch(0,gateZ,8.6,9.05,1.8,true);
for(const s of [-1,1]){
 const wingX=s*5.95,wingH=s<0?7.9:6.65,wingZ=s<0?-15.55:-14.62;
 pillar(s*6.25,wingZ,wingH,1.28);
 box(2.65,wingH-.55,1.75,wingX,(wingH-.55)/2,wingZ,darkStone);
 for(let y=1.15;y<wingH-.55;y+=1.06){const course=box(2.96,.19,2.02,wingX+s*.08,y,wingZ,trim);course.rotation.z=rr(-.025,.025)}
 box(s<0?3.2:2.45,.42,2.32,wingX+s*.15,wingH+.08,wingZ,trim);
 for(let k=0;k<(s<0?3:2);k++){const cap=box(.54,.86+rr(-.12,.22),.58,wingX+(k-1)*.82,wingH+.62,wingZ,trim);cap.rotation.z=rr(-.08,.08)}
}
for(let i=0;i<6;i++)box(9.5-i*.12,.2,1.34,0,.13+i*.17,-11.05-i*.68,trim);
const portal=mesh(new THREE.PlaneGeometry(6.75,6.35),new THREE.MeshBasicMaterial({color:'#ffa849',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),0,3.35,gateZ+.15);portal.userData.unbatched=true;const gateLight=new THREE.PointLight('#ffb64c',0,18,1.5);gateLight.position.set(0,3.25,-13);scene.add(gateLight);
// Irregular survivors replace the evenly repeated cloisters.
function ruinBlock(w,h,d,x,y,z,m=stone){
 const g=new THREE.BoxGeometry(w,h,d,2,2,2),a=g.attributes.position;
 for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i),pz=a.getZ(i),chip=.035+.055*(.5+.5*Math.sin(px*19+py*23+pz*31+x*7+z*3));a.setXYZ(i,px-Math.sign(px)*chip,py-Math.sign(py)*chip*.6,pz-Math.sign(pz)*chip)}
 g.computeVertexNormals();return mesh(g,m,x,y,z);
}
const cloisters=[];
for(const side of [-1,1])for(let j=0;j<4;j++){
 const z=-11+j*6.5,spring=[4.9,4.1,4.6,3.7][(j+(side>0?1:0))%4],rise=2.35+j*.1,broken=(side>0&&j===0)||(side<0&&j===3);cloisters.push({side,z,spring,rise,broken});
 for(const dz of [-2.4,2.4]){pillar(side*14,z+dz,spring,.85);for(let row=0;row<spring/.58;row++)ruinBlock(.36,.53,.64,side*13.43,.5+row*.58,z+dz,row%4===0?trim:stone)}
 for(let k=0;k<15;k++){
  if(broken&&k>5&&k<12)continue;
  const a=(k+.5)/15*Math.PI,q=ruinBlock(.86,.54,.68,side*14,spring+Math.sin(a)*rise,z+Math.cos(a)*2.4,k%4?stone:trim);q.rotation.x=Math.PI/2-a;
 }
 for(let k=0;k<7;k++){
  const dz=-2.55+k*.84,base=spring+Math.sin(Math.acos(Math.min(1,Math.abs(dz)/2.7)))*rise+.35,crown=spring+rise+.4+Math.sin(k*2.8+j+side)*.35;
  if(broken&&k>2)continue;
  for(let y=base;y<crown+.42;y+=.46)ruinBlock(1.12,.43,.8,side*14,y,z+dz,rand()<.2?darkStone:stone);
  if(k%3!==j%3){const q=ruinBlock(1.2,.18,.86,side*14,crown+.38,z+dz,trim);q.rotation.x=rr(-.09,.09)}
 }
}
// A few material variants sit on top of the largest wall faces.  These are not
// decals: their chipped, low-poly silhouettes catch side light and stop the
// facade from reading as a single, evenly tiled texture.
const erodedStone=new THREE.MeshStandardMaterial({map:tex,color:'#627277',normalMap:normalTex,normalScale:new THREE.Vector2(.7,.7),roughness:.88,flatShading:true});
const lichen=new THREE.MeshStandardMaterial({color:'#667252',roughness:1,flatShading:true});
function weatherFlake(x,y,z,w,h,material=erodedStone,tilt=0){
 const g=new THREE.DodecahedronGeometry(1,0),a=g.attributes.position;
 for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i),pz=a.getZ(i);a.setXYZ(i,px*(.7+.25*Math.sin(i*7+x)),py*(.65+.25*Math.cos(i*5+y)),pz*.12)}
 g.computeVertexNormals();const o=mesh(g,material,x,y,z);o.scale.set(w,h,1);o.rotation.z=tilt;return o;
}
// Two deliberately unequal landmark ruins give the courtyard a story beyond the
// portal's bilateral frame.  Both sit beyond |x|=9 and are visual-only, so they
// cannot change collision, routes, or the gate trigger.
function brokenGuardianShrine(){
 const g=new THREE.Group();g.position.set(-11.25,0,-2.35);g.rotation.y=.24;scene.add(g);
 box(3.35,.42,2.5,0,.21,0,darkStone,g);box(2.7,.34,2.05,-.1,.56,.06,trim,g);
 // A surviving niche wall, fractured well above the shoulder of its guardian.
 box(1.85,4.45,.68,-.48,2.82,.18,stone,g);
 const cap=box(2.42,.34,.92,-.42,5.02,.14,trim,g);cap.rotation.z=-.08;
 const canopy=mesh(new THREE.ConeGeometry(1.25,.76,5,1,true),darkStone,-.48,5.36,.18,g);canopy.rotation.y=.38;
 for(let k=0;k<4;k++){const a=.48+k*.7,chip=box(.42,.29,.58,-.46+Math.cos(a)*1.08,4.96+Math.sin(a)*.36,.2,stone,g);chip.rotation.z=.26-k*.16;}
 // The figure is intentionally incomplete: a heavy mantle, narrow hood, one
 // raised relic arm, and a broken stump make it read as carved history, not a prop.
 const mantle=mesh(new THREE.CylinderGeometry(.48,.82,3.18,11,2,false),trim,.05,2.2,-.34,g);mantle.rotation.z=-.08;
 const head=mesh(new THREE.SphereGeometry(.42,10,8),darkStone,-.08,4.0,-.35,g);head.scale.set(.9,1.13,.82);
 const hood=mesh(new THREE.ConeGeometry(.64,1.02,9),darkStone,-.08,4.38,-.34,g);hood.rotation.x=.1;
 const relic=cylinder(.09,.13,1.8,.69,3.1,-.31,bronze,g,7);relic.rotation.z=-.48;
 const disc=mesh(new THREE.TorusGeometry(.25,.05,6,18),gold,.98,3.82,-.31,g);disc.rotation.x=Math.PI/2;
 box(.53,.48,.62,.6,1.03,-.23,stone,g);box(.74,.24,.76,1.15,.36,.12,trim,g);
 for(let k=0;k<10;k++){const a=k*.63,q=box(.22+((k%3)*.07),.16,.3,-.35+Math.cos(a)*rr(1.15,1.82),.17,-.05+Math.sin(a)*rr(.75,1.32),k%4?stone:trim,g);q.rotation.set(rr(-.3,.3),a,rr(-.25,.25));}
}
function fallenFlyingButtress(){
 const g=new THREE.Group();g.position.set(11.85,0,-9.25);g.rotation.y=-.22;scene.add(g);
 box(3.55,.46,2.6,0,.23,0,darkStone,g);
 // An angled half-arch has slipped from the facade and now leans toward the
 // courtyard, contrasting the upright gate and leaving a broken skyline gap.
 const spine=box(.75,4.25,1.18,.32,2.22,.05,stone,g);spine.rotation.z=.31;
 const brace=box(3.45,.57,1.04,-.56,3.58,.08,trim,g);brace.rotation.z=-.56;
 const rib=mesh(new THREE.TorusGeometry(1.55,.18,7,13,Math.PI*.72),stone,-.82,3.06,.02,g);rib.rotation.z=-.48;rib.rotation.y=Math.PI/2;
 for(let k=0;k<6;k++){const a=k*.54,broken=box(.66,.42,.78,-.7+Math.cos(a)*1.78,.4+Math.sin(a)*.5,.15+Math.sin(a)*.46,k%3?stone:trim,g);broken.rotation.set(rr(-.38,.38),a,rr(-.34,.34));}
 for(let k=0;k<7;k++){const leaf=mesh(new THREE.IcosahedronGeometry(.12+rr(0,.11),0),moss,-1.23+rr(-.55,.55),rr(.45,2.35),.28+rr(-.55,.55),g);leaf.scale.set(1.3,.33,1.7);}
}
brokenGuardianShrine();fallenFlyingButtress();
// Weathering is concentrated on exposed edges and the two broad gate towers;
// the opening itself remains clear and readable as the player's destination.
for(const side of [-1,1]){
 const towerH=side<0?10.15:8.55;
 for(let i=0;i<30;i++){
  const x=side*rr(6.45,9.65),y=rr(.65,towerH-.55),z=-14.54+rr(-.012,.018);
  weatherFlake(x,y,z,rr(.08,.27),rr(.06,.22),i%5===0?lichen:erodedStone,rr(-.9,.9));
  if(i%6===0)weatherFlake(side*rr(5.55,6.45),rr(.75,6.3),-13.73,rr(.05,.16),rr(.09,.25),lichen,rr(-.7,.7));
 }
}
// Low crumbling walls and rubble keep the traversable courtyard legible.
for(const s of [-1,1]){for(let z=-9;z<18;z+=2){if(rand()>.32){box(1.1,rr(.5,1.1),1.85,s*12,.4,z);obstacles.push({x:s*12,z,r:.8})}}}
for(let i=0;i<185;i++){const side=rand()>.5?1:-1;const x=side*rr(9.3,15.4),z=rr(-17,19);const o=box(rr(.25,.85),rr(.2,.8),rr(.3,.9),x,.2,z,rand()>.5?darkStone:stone);o.rotation.set(rr(-.25,.25),rand()*6,rr(-.2,.2))}
for(let i=0;i<180;i++){const x=(rand()>.5?1:-1)*rr(9,15),z=rr(-18,20);const p=mesh(new THREE.IcosahedronGeometry(rr(.07,.18),0),moss,x,.17,z);p.scale.set(1.8,.35,1)}
function banner(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);cylinder(.045,.06,8,0,4,0,bronze,g);box(2.4,.09,.09,.85,7.4,0,bronze,g);const b=box(1.6,3.7,.045,.8,5.3,0,black,g);const ring=mesh(new THREE.TorusGeometry(.42,.018,5,32),bronze,.8,5.35,.04,g);for(let i=0;i<8;i++){const a=i*Math.PI/4;let o=box(.025,.27,.02,.8+Math.sin(a)*.57,5.35+Math.cos(a)*.57,.05,bronze,g);o.rotation.z=-a}return b}banner(-12,-4,.1);banner(12,5,-.1);banner(-10,-15,0);
function statue(x,z,scale=1){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);g.scale.setScalar(scale);box(1.9,1.1,1.9,0,.55,0,trim,g);box(2.2,.25,2.2,0,1.18,0,stone,g);cylinder(.4,.79,3.5,0,3,0,darkStone,g,9);mesh(new THREE.SphereGeometry(.42,9,8),stone,0,4.83,0,g);const hood=mesh(new THREE.ConeGeometry(.62,1.05,9),darkStone,0,5.02,-.03,g);hood.rotation.x=-.08;box(.33,.6,.07,0,4.81,.36,black,g);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;cylinder(.05,.15,3.3,Math.sin(a)*.48,2.95,Math.cos(a)*.48,stone,g,5)}cylinder(.045,.06,4.5,.88,3.05,.3,bronze,g);mesh(new THREE.OctahedronGeometry(.19),stone,.88,5.4,.3,g);obstacles.push({x,z,r:1.2*scale})}
// The free wardens sit on the tower shoulders, so the facade's carved panels
// remain visible as architecture instead of being eclipsed by a foreground prop.
// Their collision radii stay out on the existing side approach, away from the
// open central gate lane and the ember route.
statue(10.25,-7.25,.88);statue(-8.45,-13.35,.72);statue(8.6,-13.25,.68);
const fires=[];function brazier(x,z){box(.9,.6,.9,x,.35,z);cylinder(.45,.26,.27,x,.83,z,bronze);const f=mesh(new THREE.ConeGeometry(.18,.67,7),gold,x,1.23,z);glow(x,1.18,z,2);const l=new THREE.PointLight('#ff9b38',7,8,1.8);l.position.set(x,1.5,z);scene.add(l);f.userData.unbatched=true;fires.push({f,l,phase:rand()*6})}for(const p of [[-11,11],[11,11],[-11,-8],[11,-8],[-3.95,-12.82],[3.75,-12.98],[-14,1],[14,17]])brazier(...p);
// Generated mountain valley supplies continuous atmospheric depth.
const mountainTexture=new THREE.TextureLoader().load(new URL('./assets/mountains.png',import.meta.url).href);mountainTexture.colorSpace=THREE.SRGBColorSpace;
const skyEnvironment=new THREE.TextureLoader().load(new URL('./assets/mountains.png',import.meta.url).href);skyEnvironment.colorSpace=THREE.SRGBColorSpace;skyEnvironment.mapping=THREE.EquirectangularReflectionMapping;scene.environment=skyEnvironment;scene.environmentIntensity=.42;
const backdrop=mesh(new THREE.PlaneGeometry(265,132.5),new THREE.MeshBasicMaterial({map:mountainTexture,fog:false}),0,-23,-105);backdrop.castShadow=false;backdrop.receiveShadow=false;
// The valley remains open through the portal.  A previous freestanding miniature
// castle here read as a dark cut-out, so the painted mountain shelf and distant
// right-hand aqueduct now carry the horizon depth without a second focal silhouette.
// Dark irregular escarpments anchor the courtyard in the valley.
for(const side of [-1,1])for(let k=0;k<18;k++){
 const rock=mesh(new THREE.IcosahedronGeometry(rr(3,6),1),darkStone,side*rr(16,23),-rr(3,8),-22+k*3);rock.scale.set(.7,1.7,1);rock.rotation.set(rand(),rand()*6,rand());
}
// One planar pass reflects the real arch, sky and moving figures in pooled rain.
const rain=new Reflector(new THREE.PlaneGeometry(30,38),{textureWidth:640,textureHeight:400,color:0x718da4,clipBias:.002});
rain.rotation.x=-Math.PI/2;rain.position.y=.115;rain.material.transparent=true;
rain.material.vertexShader=rain.material.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 puddleUv;').replace('void main() {','void main() { puddleUv=uv;');
rain.material.fragmentShader=rain.material.fragmentShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 puddleUv;').replace('void main() {',`void main() {
 vec2 p=puddleUv*vec2(30.,38.);
 float broad=sin(p.x*.53+sin(p.y*.37)*1.7)+sin(p.y*.79-p.x*.19)*.64;
 float edge=sin(p.x*4.7+p.y*2.1)*.13+sin(p.y*8.9-p.x*1.6)*.07;
 float poolMask=smoothstep(-.30,.82,broad+edge);
 // This is the actual scene reflection, feathered through fractured paving.
` ).replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );','gl_FragColor = vec4( blendOverlay( base.rgb, color ), .035+.27*poolMask );');
scene.add(rain);rain.userData.unbatched=true;const reflectFrame=rain.onBeforeRender;let reflectionTick=0;rain.onBeforeRender=function(...args){if(reflectionTick++%2===0)reflectFrame.apply(this,args)};
// Broken interior masonry gives the courtyard distinct paths and layered depth.
for(const [x,z] of [[-5,3],[6,-4],[-8,-9],[9,8]]){
 for(let j=0;j<4;j++){const h=rr(.55,1.35);box(.78,h,.85,x+j*.7,h/2,z,j%2?stone:darkStone);box(.86,.15,.98,x+j*.7,h,z,trim)}
 obstacles.push({x:x+1,z,r:1.45});
 for(let j=0;j<15;j++){const q=box(rr(.14,.5),rr(.15,.5),rr(.2,.6),x+rr(-1,3),.18,z+rr(-1.2,1.2));q.rotation.y=rand()*6}
}
// Fine gate carvings and a suspended solar seal.
for(const side of [-1,1]){
 for(let y=1.22;y<8.1;y+=.6){for(let a=0;a<3;a++){const q=box(.035,.32,.04,side*4.3+(a-1)*.11,y+(a%2)*.1,-14.19,gold);q.rotation.z=side*(a-1)*.8}}
 for(let y=1.3;y<(side<0?7.8:6.4);y+=1.1)mesh(new THREE.TorusGeometry(.14,.035,4,8),trim,side*6.05,y,-14.12);
 for(const offset of [-.57,.57])cylinder(.12,.12,side<0?7.1:5.9,side*6.05+offset,(side<0?7.1:5.9)/2,-14.08,trim);
}
mesh(new THREE.TorusGeometry(.48,.035,6,40),gold,0,10.35,-14.1);
for(let k=0;k<12;k++){const a=k/12*Math.PI*2,q=box(.035,.3,.03,Math.sin(a)*.7,10.35+Math.cos(a)*.7,-14.09,gold);q.rotation.z=-a}
for(let i=0;i<250;i++){const side=i%2?1:-1,x=side*rr(11.8,14.5),z=rr(-17,17),y=rand()<.75?rr(.1,.7):rr(1,5);const leaf=mesh(new THREE.IcosahedronGeometry(rr(.04,.13),0),moss,x,y,z);leaf.scale.set(1,.4,1.8)}
// Offset ruin masses and hanging foliage interrupt the repeated arcade rhythm.
for(let y=.6;y<9;y+=.65){box(2.5,.61,1.5,-12.8,y,-9,darkStone);if(y<6.5)box(1.6,.61,3.2,-13.6,y,-10.9,stone)}
for(let i=0;i<6;i++){const q=box(rr(.6,1.2),rr(.4,.9),rr(.5,1.1),-12.8+rr(-1.2,1.2),9+rr(-.1,.4),-9+rr(-.6,.6));q.rotation.z=rr(-.2,.2)}
for(let k=0;k<85;k++){const t=rand(),x=-12.1+rr(-.5,.5),y=8-t*5,z=-8.1+Math.sin(t*18)*.25;const leaf=mesh(new THREE.IcosahedronGeometry(rr(.07,.17),0),moss,x,y,z);leaf.scale.set(1.2,.45,1)}
// Deep carved archivolts, clustered columns and canopied figure niches. The
// dark back ribs make the opening feel cut into a thick wall before the pale
// and gold details catch the lantern light.
function pointedRib(x,y,z,w,h,r,material=trim,rotation=0){const points=[];for(let i=0;i<=48;i++){const t=i/48;points.push(new THREE.Vector3(x+Math.cos(rotation)*(t-.5)*w,y+h*(1-Math.pow(Math.abs(t*2-1),1.5)),z+Math.sin(rotation)*(t-.5)*w))}return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,r,7,false),material)}
for(let band=0;band<3;band++)pointedRib(0,4.5,-15.18-band*.1,9.35+band*.34,4.82+band*.2,.16-band*.022,darkStone);
for(let band=0;band<5;band++)pointedRib(0,4.55,-14.04-band*.065,8.52+band*.28,4.4+band*.15,.07+band*.012,band===1?stone:trim);
for(const side of [-1,1]){
 for(const dx of [-.4,-.2,.2,.4]){cylinder(.07,.09,4.25,side*4.3+dx,2.52,-14.02,trim,scene,12);cylinder(.12,.16,.19,side*4.3+dx,.53,-14.02,trim,scene,12)}
 pointedRib(side*5.95,4.1,-13.89,side<0?2.45:2.05,side<0?2.55:2.2,.1);pointedRib(side*5.95,4.1,-13.83,side<0?2.18:1.76,side<0?2.3:1.96,.055);
 for(const dx of [-.91,.91])cylinder(.09,.12,side<0?4.25:3.65,side*5.95+dx,(side<0?4.25:3.65)/2,-13.82,trim,scene,12);
 const nicheLight=new THREE.PointLight('#ffb768',12,8,1.3);nicheLight.position.set(side*5.95,2,-12.8);scene.add(nicheLight);
 for(let y=2;y<(side<0?7.4:6);y+=1.7){const a=mesh(new THREE.TorusGeometry(.21,.045,6,4),trim,side*6.05,y,-14.02);a.rotation.z=Math.PI/4;}
}
for(const {side,z,spring,rise,broken} of cloisters){
 if(!broken)for(let band=0;band<2;band++)pointedRib(side*14-side*(.5+band*.08),spring,z,4.8+band*.15,rise+band*.1,.06,trim,Math.PI/2);
 for(const dz of [-2.4,2.4])for(const offset of [-.23,.23])cylinder(.07,.09,spring-.3,side*13.51,(spring+.3)/2,z+dz+offset,trim,scene,10);
}
// Folded stone mantles turn the shrine silhouettes into carved figures.
for(const [x,z,sc] of [[10.55,-4.85,1.58],[-4.7,-14,1],[4.7,-14,1]]){
 const geo=new THREE.CylinderGeometry(.44,.77,3.6,48,16,true),pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getZ(i),pos.getX(i)),t=(1.8-pos.getY(i))/3.6,f=1+Math.sin(a*14+t*2.4)*.13+Math.sin(a*23)*.045;pos.setX(i,pos.getX(i)*f);pos.setZ(i,pos.getZ(i)*f)}geo.computeVertexNormals();const mantle=mesh(geo,trim,x,3*sc,z+.04);mantle.scale.setScalar(sc);
 const head=mesh(new THREE.LatheGeometry([new THREE.Vector2(.35,0),new THREE.Vector2(.43,.24),new THREE.Vector2(.3,.63),new THREE.Vector2(.025,.89)],24),stone,x,4.44*sc,z);head.scale.setScalar(sc);
 for(const sign of [-1,1]){const arm=cylinder(.15,.22,1.52,x+sign*.46*sc,3.69*sc,z+.23*sc,trim);arm.rotation.z=sign*.37;}
 for(let k=0;k<4;k++){const chain=mesh(new THREE.TorusGeometry(.38+k*.05,.024,5,32,Math.PI),trim,x,(3.64-k*.15)*sc,z+.48*sc);chain.rotation.z=Math.PI;chain.scale.y=.55;}
}
// Descending foreground stairs and torn walls connect the platform to the cliff.
for(let k=0;k<9;k++)box(7,.28,1.1,-10,-k*.26,19+k*.75,trim);
for(const [x,z]of [[-6.4,18.7],[12.8,17.8]]){pillar(x,z,2.25,1.3);for(let y=.5;y<1.8;y+=.45)box(2.2,.39,.85,x-1.4,y,z,stone)}
// Fine, sparse grasses gather in wet joints beside broken masonry.
const grassMat=new THREE.MeshStandardMaterial({color:'#72754a',roughness:1,side:THREE.DoubleSide});
for(let i=0;i<360;i++){const x=(i%2?1:-1)*rr(10,15),z=rr(-17,20);for(let b=0;b<3;b++){const h=rr(.16,.48),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([x-.025,.13,z,x+.025,.13,z,x+rr(-.15,.15),h,z+rr(-.12,.12)],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();mesh(geo,grassMat)}}
// Deliberate clumps give the vegetation a few readable roots instead of an
// even green noise field.  They stay beside rubble and leave the travel lane open.
for(const [x,z,s] of [[-10.4,13.2,1],[-8.8,7.4,.75],[-11.2,1.8,1.1],[-9.7,-7.6,.8],[10.2,13.8,1],[11.6,6.2,.82],[10.1,-5.1,1.05],[8.8,-11.2,.8],[-6.9,15.2,.7],[7.1,16.1,.72]]){
 for(let b=0;b<7;b++){const h=rr(.26,.66)*s,geo=new THREE.BufferGeometry(),ox=rr(-.38,.38)*s,oz=rr(-.35,.35)*s;geo.setAttribute('position',new THREE.Float32BufferAttribute([x+ox-.035,.14,z+oz,x+ox+.035,.14,z+oz,x+ox+rr(-.16,.16),h,z+oz+rr(-.14,.14)],3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();mesh(geo,grassMat)}
}
// Broken gatehouse layers make the facade wide and weathered, with an uneven crown.
for(const side of [-1,1]){
 const courses=side<0?12:9,baseX=side*6.05;
 for(let course=0;course<courses;course++){
  const y=.4+course*.65,span=course>courses-3?2:3;
  for(let col=0;col<span;col++){
   if(side>0&&course>5&&col===span-1)continue;
   const q=box(.91,.61,2.7,baseX+side*(col-1)*.9,y,-15.8,course%5===0?trim:stone);q.rotation.z=rr(-.018,.018);
  }
  if(course<courses-2)box(.6,.62,3.05,side*7.72,y,-15.65,darkStone);
 }
 for(const y of side<0?[5.2,7.75]:[4.5,6.15])box(side<0?3.8:2.8,.28,3.6,baseX-side*.3,y,-15.45,trim);
 for(const dx of [-1.28,1.28]){const h=side<0?8.4:6.2;cylinder(.16,.2,h,baseX+dx,h/2,-13.68,trim,scene,12);for(const y of [1,4.5])cylinder(.25,.25,.22,baseX+dx,y,-13.68,trim)}
 box(1.38,3.9,.075,baseX,3.2,-14.01,black);
 pointedRib(baseX,4.8,-13.58,side<0?2.55:2.2,side<0?2.6:2.25,.16,stone);
 for(let y=side<0?5.7:4.85;y<(side<0?7.8:6.3);y+=.7){const glyph=box(.035,.38,.04,baseX,y,-13.65,gold);glyph.rotation.z=.45;const cross=box(.33,.035,.04,baseX,y,-13.64,gold);cross.rotation.z=-.3;}
}
// Deep, narrow relief bays give the gate a hand-carved focal detail.  Their
// dimensions deliberately follow the existing side niches, leaving the centre
// arch, its portal plane, and the walkable trigger lane completely unobstructed.
function gateReliefBay(side){
 const x=side*6.05,w=side<0?1.22:1.08,h=side<0?3.48:3.12,y=side<0?3.28:2.96,z=-13.545;
 const panel=mesh(new THREE.PlaneGeometry(w,h,1,1),carvedRelief,x,y,z);panel.rotation.z=side*.018;panel.castShadow=false;panel.receiveShadow=true;
 const front=-13.515,edge=.105;
 box(w+edge*2,edge,.09,x,y+h*.5+edge*.5,front,trim);box(w+edge*2,edge,.09,x,y-h*.5-edge*.5,front,trim);
 box(edge,h+.18,.09,x-w*.5-edge*.5,y,front,trim);box(edge,h+.18,.09,x+w*.5+edge*.5,y,front,trim);
 // A chipped sill grounds the image in masonry rather than reading as a poster.
 const sill=ruinBlock(w+.42,.16,.16,x,y-h*.5-.18,-13.48,side<0?trim:stone);sill.rotation.z=side*.035;
}
gateReliefBay(-1);gateReliefBay(1);
// Two carved wardens live inside the same narrow facade bays rather than beside
// the gate as freestanding props.  Their pale mantles, black hood recesses and
// tiny reliquary discs remain readable from the courtyard while the lane stays
// completely open between them.
function gateGuardianNiche(side){
 const x=side*6.05,z=-13.43,y=2.98,scale=side<0?1:.91;
 const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);scene.add(g);
 // The shallow backing and canopy preserve a true architectural recess.
 box(1.02,3.02,.12,0,0,-.075,darkStone,g);
 const hoodArch=mesh(new THREE.TorusGeometry(.47,.075,7,18,Math.PI),trim,0,1.12,.015,g);hoodArch.rotation.z=Math.PI;
 box(1.13,.12,.14,0,-1.54,.03,trim,g);
 for(const s of [-1,1])cylinder(.07,.1,2.82,s*.48,-.12,.02,trim,g,9);
 // One heavy folded mantle and a recessed hood read as a weathered guardian at
 // this scale.  The short staff and disc give each side a human silhouette.
 const mantle=mesh(new THREE.CylinderGeometry(.33,.51,1.92,10,3,false),stone,0,-.48,.105,g);mantle.rotation.z=side*.035;
 const shoulders=mesh(new THREE.SphereGeometry(.43,10,7),trim,0,.31,.11,g);shoulders.scale.set(1,.55,.62);
 const hood=mesh(new THREE.ConeGeometry(.39,.68,9),darkStone,0,.48,.13,g);hood.rotation.x=.11;
 const face=mesh(new THREE.SphereGeometry(.19,8,6),black,0,.35,.4,g);face.scale.set(.9,1.18,.38);
 const staff=cylinder(.038,.055,1.56,side*.29,-.25,.42,bronze,g,7);staff.rotation.z=side*.09;
 const relic=mesh(new THREE.TorusGeometry(.13,.026,5,16),gold,side*.36,.53,.43,g);relic.rotation.x=Math.PI/2;
 for(let k=0;k<4;k++){const fold=box(.045,.8,.05,(k-1.5)*.12,-.48,.48,trim,g);fold.rotation.z=(k-1.5)*.075;}
}
gateGuardianNiche(-1);gateGuardianNiche(1);
// The archivolt is a damaged procession rather than an even ring of UI-like ticks.
// Each surviving glyph is recessed, with uneven spacing, broken sockets and only a
// few dim anchor marks near the crown.
{
 const spring=9.05-8.6*.52;
 const gaps=new Set([1,6,10,17,23]);
 const drift=[-.18,.09,-.04,.14,-.1,.03,.2,-.12,.06,-.16,.1,-.05,.17,-.08,.04,.12,-.14,.02,.16,-.1,.07,-.19,.11,-.06,.05];
 const fade=[.34,.2,.5,.28,.68,.18,.42,.24,.58,.31,.16,.84,.38,.57,.23,.46,.19,.33,.7,.25,.52,.17,.41,.22,.3];
 for(let i=0;i<25;i++){
  if(gaps.has(i))continue;
  const a=(i+.5+drift[i]) / 25*Math.PI,rad=4.43,x=Math.cos(a)*rad,y=spring+Math.sin(a)*5.02;
  const socket=box(.13+(i%3)*.018,.31+(i%4)*.035,.055,x,y,-13.18,darkStone);socket.rotation.z=a-Math.PI/2+(i%3-1)*.065;
  const anchor=i===11||i===18, glyph=anchor?trim:runeGlow.clone();
  if(!anchor)glyph.opacity=fade[i]*.68;
  const mark=box(anchor?.062:.034+(i%3)*.008,anchor?.27:.12+(i%4)*.025,.035,x,y,-13.145,glyph);mark.rotation.z=a-Math.PI/2+(i%5-2)*.095;
  if(i===4||i===14||i===20){const chip=box(.09,.026,.02,x,y+.075,-13.12,trim);chip.rotation.z=a-.31;}
 }
}
// Two different wardens protrude just enough from the deeper bays to read from
// the opening frame.  They remain decorative geometry beyond the portal lane.
for(const [side,scale,lean] of [[-1,1.13,-.08],[1,.96,.11]]){
 const g=new THREE.Group();g.position.set(side*5.86,2.55,-13.3);g.scale.setScalar(scale);g.rotation.z=lean;scene.add(g);
 const mantle=mesh(new THREE.CylinderGeometry(.38,.66,2.45,9,3,false),side<0?trim:stone,0,-.48,.08,g);mantle.rotation.z=side*.055;
 const cowl=mesh(new THREE.SphereGeometry(.48,9,7),trim,0,.48,.12,g);cowl.scale.set(1,.55,.63);
 const hood=mesh(new THREE.ConeGeometry(.41,.72,9),black,0,.68,.18,g);hood.rotation.x=.09;
 const face=mesh(new THREE.SphereGeometry(.17,7,6),black,0,.52,.44,g);face.scale.set(.85,1.2,.35);
 const staff=cylinder(.04,.065,1.88,side*.31,-.32,.47,bronze,g,7);staff.rotation.z=side*.11;
 for(let fold=0;fold<5;fold++){const q=box(.045,.92,.045,(fold-2)*.13,-.53,.48,fold===1?darkStone:stone,g);q.rotation.z=(fold-2)*.08;}
 // One cracked halo is missing a wedge; the other has fallen into the sill.
 for(let k=0;k<(side<0?5:3);k++){const a=(k+(side<0?0:2))*Math.PI/3,chip=ruinBlock(.18,.12,.12,Math.cos(a)*.61,.62+Math.sin(a)*.57,.48,trim);chip.removeFromParent();g.add(chip);chip.rotation.z=a;}
}
// A collapsed crown leaves a deliberate opening to the mountain sky over the portal.
for(const [x,y,w] of [[-3.8,8.95,2.65],[-1.45,8.62,1.82],[2.95,8.5,2.1],[5.05,7.92,1.3]]){
 const crown=ruinBlock(w,.6,2.7,x,y,-15.75,trim);crown.rotation.z=rr(-.06,.07);
}
// Massive, stepped outer towers turn the portal into a real facade. Their uneven
// silhouettes and shallow front buttresses frame the gate without entering the
// central path or changing its collision lane.
for(const side of [-1,1]){
 const towerX=side*8.15, towerH=side<0?10.15:8.55;
 for(let row=0;row<Math.ceil(towerH/.62);row++){
  const y=.34+row*.62, taper=Math.max(0,row-(towerH/.62-4))*.13;
  const width=3.42-taper+(row%4===0?.18:0), depth=3.18-(row%3)*.12;
  const shift=side*(row%2?.07:-.04);
  const block=ruinBlock(width,.58,depth,towerX+shift,y,-16.18,row%5===0?trim:(row%3?stone:darkStone));
  block.rotation.z=rr(-.018,.018);
  if(row%4===0){const course=ruinBlock(width+.34,.16,depth+.25,towerX+shift,y+.31,-16.18,trim);course.rotation.z=rr(-.025,.025)}
 }
 // A collapsed shoulder steps toward the viewer and gives each tower a distinct,
 // weathered base rather than another flat rectangular wing.
 for(let step=0;step<4;step++){
  const spur=ruinBlock(1.62-step*.16,.72,2.25-step*.16,side*(5.55+step*.36),.36+step*.52,-14.22-step*.28,step===0?darkStone:stone);
  spur.rotation.z=side*(.085+step*.015);
 }
 for(let cap=0;cap<5;cap++){
  if((side<0&&cap===3)||(side>0&&cap===1))continue;
  const capstone=ruinBlock(.64,.84+rr(-.1,.32),.92,towerX+side*(cap-2)*.63,towerH+.38,-16.1,cap%2?stone:trim);
  capstone.rotation.z=rr(-.11,.1);
 }
 // Recessed roundels are low-relief masonry until the gate wakes, so their warm
 // centres can act as a readable destination cue without looking like UI.
 const medallion=mesh(new THREE.TorusGeometry(.58,.115,7,24),trim,side*6.72,4.55,-14.48);
 medallion.rotation.y=0;
 mesh(new THREE.TorusGeometry(.29,.045,6,18),darkStone,side*6.72,4.55,-14.55);
 for(let ray=0;ray<8;ray++){const a=ray*Math.PI/4,mark=box(.045,.26,.045,side*6.72+Math.sin(a)*.42,4.55+Math.cos(a)*.42,-14.4,gold);mark.rotation.z=-a;}
 for(let vine=0;vine<15;vine++){
  const t=vine/14,leaf=mesh(new THREE.IcosahedronGeometry(.1+rand()*.09,0),moss,side*(6.75+Math.sin(t*9)*.16),6.8-t*2.3,-14.2+Math.cos(t*8)*.12);
  leaf.scale.set(.85,.28,1.5);
 }
}
// Broken bridge stones span only part of the crown, leaving a jagged gap for the
// mountain skyline and stopping the facade from reading as a symmetric castle.
for(const [x,y,w] of [[-6.05,9.95,2.25],[-3.55,10.2,1.72],[3.92,9.28,2.12],[6.55,8.8,1.1]]){
 const lintel=ruinBlock(w,.55,3.25,x,y,-16.02,trim);lintel.rotation.z=rr(-.075,.075);
}
// Substantial foreground broken parapets frame the stair approach.
const ivyMat=new THREE.MeshStandardMaterial({color:'#465447',roughness:1});
for(const [x,z,length]of [[-9,16.9,6],[9.6,17.5,4.8],[-11.4,7.5,4]]){
 for(let row=0;row<4;row++)for(let col=0;col<Math.floor(length/.85);col++){
  if(row===3&&rand()<.32)continue;
  box(.81,.43,1.22,x+(col-length/1.7)*.85+(row%2)*.22,.28+row*.44,z,rand()<.25?darkStone:stone);
 }
 for(let k=0;k<Math.floor(length/.9);k++)if(k!==2){const q=ruinBlock(.86,.22,1.4,x-length*.5+k*.9,1.91+rr(-.1,.09),z,trim);q.rotation.y=rr(-.05,.05)}
}
// Close asymmetric pier stumps break the lower frame into weathered silhouettes.
// They stay outside the collision lane (|x| > 9), so the opening remains playable.
for(const [side,z,height] of [[-1,14.6,3.6],[1,15.2,3.05],[-1,10.9,2.15],[1,11.7,1.7]]){
 const x=side*(10.2+rr(-.38,.42));
 for(let row=0;row<Math.ceil(height/.48);row++){
  const chipped=ruinBlock(rr(.88,1.35),rr(.37,.54),rr(.9,1.38),x+rr(-.08,.08),.24+row*.46,z+rr(-.34,.34),row%4===0?trim:(row%3?stone:darkStone));
  chipped.rotation.y=rr(-.16,.16);
  if(row>2&&row%3===1)chipped.rotation.z=side*rr(.05,.16);
 }
 box(2.15,.22,1.82,x,.2,z,darkStone);
 for(let shard=0;shard<11;shard++){
  const q=ruinBlock(rr(.18,.62),rr(.14,.42),rr(.22,.7),x+rr(-1.45,1.45),.15,z+rr(-1.18,1.18),shard%4?stone:trim);
  q.rotation.set(rr(-.45,.45),rr(0,6),rr(-.35,.35));
 }
 for(let sprig=0;sprig<7;sprig++){
  const leaf=mesh(new THREE.IcosahedronGeometry(rr(.1,.19),0),ivyMat,x+side*rr(.4,.9),rr(.35,Math.min(1.75,height)),z+rr(-.75,.75));
  leaf.scale.set(1.25,.35,1.7);
 }
}
// A handful of large failed masonry pieces replace the remaining neat rubble rhythm.
// They sit at the edge of the approach and do not enter the central collision lane.
for(const [x,z,w,h,d,tilt] of [[-12.6,12.8,3.4,1.15,2.1,-.28],[-11.8,5.2,2.8,.9,2.55,.34],[12.1,13.4,3.1,.82,1.9,.22],[13.25,3.6,2.45,1.35,2.2,-.31]]){
 const fallen=ruinBlock(w,h,d,x,h*.45,z,darkStone);fallen.rotation.set(tilt*.34,rr(-.35,.35),tilt);
 for(let chip=0;chip<5;chip++){const shard=ruinBlock(rr(.28,.72),rr(.18,.42),rr(.3,.8),x+rr(-w*.75,w*.75),.18,z+rr(-d*.8,d*.8),chip%3?stone:trim);shard.rotation.set(rr(-.4,.4),rr(-.6,.6),rr(-.3,.3));}
}
// Layered remnants stand beyond the playable paths.
for(const [x,z,h] of [[-15.2,-15.8,9.1],[-16,-4.1,5.8],[15.5,-16.8,6.5],[16,1.8,3.5],[-15.4,13.4,3.1]]){
 for(let row=0;row<h/.57;row++){
  const y=.4+row*.57,w=row>h/.57-3?.65:1.05;
  ruinBlock(w,.53,.95,x+Math.sin(row*2.7)*.045,y,z,row%5===0?trim:stone);
  if(row%5===0)ruinBlock(1.35,.17,1.24,x,y+.27,z,trim);
 }
 for(let k=0;k<3;k++)ruinBlock(.31,rr(.2,.6),.43,x+(k-1)*.32,h+.25,z+rr(-.2,.2));
}
// Rooted ivy cascades from the crowns into fallen masonry.
for(const {side,z,spring,rise} of cloisters){
 for(let strand=0;strand<4;strand++){
  const anchor=z-2.3+strand*1.35,top=spring+rise+.3,length=rr(1.1,3.5);
  for(let k=0;k<13;k++){
   const t=k/12,leaf=mesh(new THREE.IcosahedronGeometry(rr(.09,.19),0),k%3?ivyMat:moss,side*13.37,top-t*length,anchor+Math.sin(t*7+strand)*.16);leaf.scale.set(.45,1,1.5);leaf.rotation.x=rr(-.6,.6);
  }
 }
 for(let k=0;k<12;k++){
  const xx=side*rr(12.3,15.1),zz=z+rr(-2.5,2.5),q=ruinBlock(rr(.25,.7),rr(.15,.45),rr(.3,.9),xx,.25,zz,k%3?stone:trim);q.rotation.set(rr(-.4,.4),rr(0,6),rr(-.3,.3));
  const growth=mesh(new THREE.IcosahedronGeometry(rr(.13,.26),0),ivyMat,xx,.48,zz);growth.scale.set(1.3,.45,1);
 }
}
// A last set of close ruin silhouettes deliberately breaks the courtyard's
// remaining arena symmetry.  These props are all beyond the side collision
// wall (|x| > 11.5); they add a hand-built foreground without changing routes.
function fracturedSentinel(x,z,turn,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=turn;g.scale.setScalar(scale);scene.add(g);
 const block=(w,h,d,bx,by,bz,m=stone)=>{const o=ruinBlock(w,h,d,bx,by,bz,m);o.removeFromParent();g.add(o);return o};
 // A broad, broken plinth keeps the figure legible from the low oblique camera.
 // Its unequal courses, root growth and talus make it a ruin rather than a prop.
 const plinth=block(3.05,.42,2.42,0,.22,0,darkStone);plinth.rotation.z=-.035;
 const step=block(2.58,.29,1.94,-.12,.54,.05,trim);step.rotation.y=.08;
 for(let i=0;i<16;i++){const a=i*.69,q=block(.16+(i%3)*.12,.12+(i%2)*.13,.18+(i%4)*.09,-.08+Math.cos(a)*rr(1.04,1.76),.15,-.04+Math.sin(a)*rr(.8,1.33),i%4?stone:trim);q.rotation.set(rr(-.44,.44),a,rr(-.4,.4));}
 // The hooded warden is built as one asymmetrical draped silhouette: the tapered
 // mantle, shoulder cowl and dark face recess read clearly before small details.
 const mantle=mesh(new THREE.CylinderGeometry(.42,.91,2.5,11,4,false),trim,-.05,1.76,.05,g);mantle.rotation.z=.085;
 const shoulders=mesh(new THREE.SphereGeometry(.68,11,8),stone,-.08,2.77,.04,g);shoulders.scale.set(1,.48,.62);
 const hood=mesh(new THREE.ConeGeometry(.58,.92,10,2,false),darkStone,-.18,3.36,.02,g);hood.rotation.set(.12,0,-.12);
 const face=mesh(new THREE.SphereGeometry(.25,8,7),black,-.2,3.17,.37,g);face.scale.set(.85,1.15,.36);
 // Vertical folded strips turn the simple mantle into chipped stone drapery.
 for(let k=0;k<7;k++){const fold=mesh(new THREE.CapsuleGeometry(.07,.96,3,6),k%3?stone:darkStone,-.49+k*.15,1.73,.72,g);fold.rotation.z=(k-3)*.075;fold.rotation.x=.13;}
 const arm=mesh(new THREE.CapsuleGeometry(.15,.94,4,7),stone,.62,2.35,.22,g);arm.rotation.z=-.56;
 const staff=cylinder(.043,.065,2.8,.95,2.05,.34,bronze,g,7);staff.rotation.z=-.1;
 const reliquary=mesh(new THREE.OctahedronGeometry(.28,1),gold,.98,3.56,.34,g);reliquary.rotation.z=.32;
 const halo=mesh(new THREE.TorusGeometry(.32,.045,6,16),trim,-.18,3.49,-.02,g);halo.rotation.x=Math.PI/2;
 // Chipped halo shards, ivy and a snapped fragment let the statue feel excavated.
 for(let k=0;k<5;k++){const a=.25+k*.82,chip=block(.25,.13,.18,-.18+Math.cos(a)*.63,3.48+Math.sin(a)*.61,.04,k%2?stone:trim);chip.rotation.z=a+.4;}
 for(let k=0;k<22;k++){const leaf=mesh(new THREE.IcosahedronGeometry(.08+rr(0,.08),0),k%3?ivyMat:moss,rr(-.78,.55),rr(.25,2.55),.72+rr(-.14,.12),g);leaf.scale.set(1.25,.34,1.5);}
 const snapped=block(.34,1.42,.44,-.74,1.2,-.2,darkStone);snapped.rotation.z=-.33;
}
fracturedSentinel(-12.9,15.8,.33,1.08);
fracturedSentinel(12.55,13.85,-.5,1.02);

// Dense facade scars sit on the outer gate piers.  They have no collider and
// remain beyond the central portal lane; the broken carved arcs point inward to
// make the gateway feel cut from a much older, thicker ruin.
function gatePierScar(side){
 const g=new THREE.Group();g.position.set(side*8.35,0,-14.42);g.rotation.y=side*.05;scene.add(g);
 const block=(w,h,d,x,y,z,m=stone)=>{const o=ruinBlock(w,h,d,x,y,z,m);o.removeFromParent();g.add(o);return o};
 // Offset buttress courses create a chipped, stepped edge rather than a tower face.
 for(let row=0;row<9;row++){
  const y=.32+row*.54,w=1.15-(row>6?(row-6)*.09:0),x=side*(.1+(row%2)*.09);
  const course=block(w,.48,.76,x,y,.06,row%3?stone:trim);course.rotation.z=side*rr(-.04,.045);
  if(row===3||row===7){const lip=block(1.42,.14,.96,x+side*.06,y+.28,.03,trim);lip.rotation.z=side*.05;}
 }
 // Three incomplete archivolt fragments are intentionally different in span and tilt.
 for(const [a,span,rise,tilt] of [[.18,1.72,1.52,.16],[.46,1.38,1.12,-.22],[.74,1.06,.86,.31]]){
  const arc=mesh(new THREE.TorusGeometry(span*.48,.105,6,12,Math.PI*.52),a>.5?darkStone:trim,side*(.07+span*.1),4.15+rise*.14,.42,g);
  arc.rotation.set(0,side*Math.PI/2,side*(Math.PI*.1+tilt));
 }
 // Shallow sun rosettes, a cracked niche and stone talus concentrate fine scale near the objective.
 const niche=mesh(new THREE.CylinderGeometry(.48,.48,.12,9,1,false),darkStone,side*.16,3.34,.43,g);niche.rotation.x=Math.PI/2;
 for(let k=0;k<8;k++){const a=k*Math.PI/4,ray=block(.05,.24,.05,side*.16+Math.sin(a)*.42,3.34+Math.cos(a)*.42,.52,k%3?stone:trim);ray.rotation.z=-a;}
 for(let k=0;k<19;k++){const q=block(rr(.16,.46),rr(.1,.32),rr(.16,.48),side*rr(.45,1.38),.14,rr(-.75,.72),k%4?stone:trim);q.rotation.set(rr(-.4,.4),rr(0,6),rr(-.35,.35));}
 for(let k=0;k<18;k++){const leaf=mesh(new THREE.IcosahedronGeometry(rr(.07,.15),0),k%3?ivyMat:moss,side*rr(.25,.94),rr(.25,3.25),.63+rr(-.13,.08),g);leaf.scale.set(1.35,.33,1.45);}
}
gatePierScar(-1);gatePierScar(1);

// One collapsed side arcade presents a visibly different rhythm from the
// long repeated cloisters: a short surviving pier, a leaning impost and an
// open, missing half of the vault.  It remains purely visual outside the lane.
{
 const g=new THREE.Group();g.position.set(-13.45,0,5.65);g.rotation.y=.07;scene.add(g);
 const block=(w,h,d,x,y,z,m=stone)=>{const o=ruinBlock(w,h,d,x,y,z,m);o.removeFromParent();g.add(o);return o};
 for(const [z,h,w] of [[-2.35,5.45,.92],[2.28,3.35,.78]]){
  for(let row=0;row<Math.ceil(h/.55);row++){
   if(z>0&&row>4)break;
   const q=block(w+(row%3)*.08,.5,.82,0,.27+row*.52,z+(row%2)*.05,row%4?stone:trim);q.rotation.z=(z<0?-1:1)*rr(-.032,.042);
  }
 }
 const spring=4.72;
 for(let i=0;i<12;i++){
  if(i>6&&i<10)continue;
  const a=(i+.5)/12*Math.PI,brick=block(.86,.48,.64,0,spring+Math.sin(a)*2.02,-.02+Math.cos(a)*2.38,i%3?stone:trim);
  brick.rotation.x=a-Math.PI/2;brick.rotation.z=.06;
 }
 const slipped=block(3.35,.55,1.02,.15,3.9,1.9,darkStone);slipped.rotation.set(.06,.12,.44);
 for(let i=0;i<13;i++){const q=block(rr(.22,.68),rr(.14,.39),rr(.24,.72),rr(-1.1,1.5),.18,rr(-3.15,3.18),i%3?stone:trim);q.rotation.set(rr(-.4,.4),rr(0,6),rr(-.35,.35));}
 for(let i=0;i<18;i++){const leaf=mesh(new THREE.IcosahedronGeometry(rr(.09,.18),0),i%3?ivyMat:moss,rr(-.62,.55),rr(.28,4.55),-2.3+rr(-.44,.44),g);leaf.scale.set(1.2,.35,1.55);}
}

// A near, deliberately uneven layer of archaeological debris gives the opening
// third of the view weight.  The piles are all beyond the movement clamp or
// tucked against the outer wall: they never create a new collider or block an
// ember route.  Each pile has a different footprint, course height and fallen
// direction so it reads as a collapsed structure rather than a cuboid fence.
function foregroundRuinPile(x,z,turn,spread,levels){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=turn;scene.add(g);
 const block=(w,h,d,bx,by,bz,m=stone)=>{const o=ruinBlock(w,h,d,bx,by,bz,m);o.removeFromParent();g.add(o);return o};
 const base=block(spread*1.34,.23,spread*.78,0,.13,0,darkStone);base.rotation.z=rr(-.05,.05);
 // A snapped plinth has stepped, chipped courses and a missing corner.
 for(let row=0;row<levels;row++){
  const pieces=2+(row%2),y=.31+row*.34;
  for(let j=0;j<pieces;j++){
   if((row+j)%5===1)continue;
   const q=block(rr(.44,.87),rr(.22,.36),rr(.38,.78),
    -spread*.37+j*spread*.35+rr(-.12,.12),y,rr(-spread*.24,spread*.24),
    (row+j)%4===0?trim:((row+j)%3?stone:darkStone));
   q.rotation.set(rr(-.11,.11),rr(-.18,.18),rr(-.1,.1));
  }
 }
 // Half-buried carved tablets give the closest masonry a readable history.
 // They face the player through the broken courses rather than forming another
 // neat wall, and their fractured sizes keep each foreground heap distinct.
 for(let face=0;face<(levels>3?3:2);face++){
  const w=rr(.42,.74),h=rr(.34,.62),px=rr(-spread*.43,spread*.38),py=.48+face*.31,pz=spread*.305+rr(-.025,.05);
  const backing=block(w+.12,h+.11,.08,px,py,pz+.025,face%2?trim:darkStone);backing.rotation.z=rr(-.13,.13);
  const tablet=mesh(new THREE.PlaneGeometry(w,h),carvedRelief,px,py,pz+.075,g);tablet.rotation.z=backing.rotation.z;
  // A chipped edge and a small missing corner stop the relief from reading as
  // a clean decal while retaining the fine carved material at game distance.
  const chip=block(rr(.11,.2),rr(.07,.15),.095,px+w*.31,py+h*.29,pz+.09,trim);chip.rotation.z=rr(-.55,.55);
 }
 // Talus continues from the broken plinth into loose, multi-size stones.
 for(let i=0;i<15;i++){
  const a=rr(0,Math.PI*2),r=rr(spread*.36,spread*.92);
  const q=block(rr(.13,.54),rr(.1,.34),rr(.15,.58),Math.cos(a)*r,.12,Math.sin(a)*r*.62,i%4?stone:trim);
  q.rotation.set(rr(-.55,.55),rr(0,6),rr(-.42,.42));
 }
 // Moss clings to the damp lower side rather than appearing as a uniform lawn.
 for(let i=0;i<18;i++){
  const a=rr(-2.85,-.22),r=rr(spread*.28,spread*.88);
  const leaf=mesh(new THREE.IcosahedronGeometry(rr(.08,.19),0),i%4?ivyMat:moss,Math.cos(a)*r,.18+rr(0,.14),Math.sin(a)*r*.58,g);
  leaf.scale.set(rr(.8,1.65),.28,rr(.9,1.7));
 }
 // A few individual blades break the puddle edge into real, rooted detail.
 for(let i=0;i<9;i++){
  const bx=rr(-spread*.65,spread*.65),bz=rr(-spread*.38,spread*.38),h=rr(.2,.58),blade=new THREE.BufferGeometry();
  blade.setAttribute('position',new THREE.Float32BufferAttribute([bx-.025,.14,bz,bx+.025,.14,bz,bx+rr(-.13,.13),h,bz+rr(-.1,.1)],3));
  blade.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));blade.computeVertexNormals();mesh(blade,grassMat,0,0,0,g);
 }
}
foregroundRuinPile(-12.55,17.65,.42,2.9,4);
foregroundRuinPile(12.9,16.55,-.38,2.45,3);
foregroundRuinPile(-12.35,8.8,.18,2.05,3);
// The same fractured material field continues under rubble seams, so the
// foreground stays navigable and never acquires separate coloured water cards.

// A separate, partial aqueduct emerges from the right mountain shelf.  Its
// unpaired piers and incomplete spans keep the vista asymmetrical and avoid a
// second full facade competing with the playable gate.
{
 const g=new THREE.Group();g.position.set(15.8,-3.4,-97.4);g.rotation.y=-.08;g.scale.setScalar(.82);scene.add(g);
 const pier=(x,h,w)=>{box(w,h,.28,x,h*.5,0,distantStone,g);box(w*1.26,.12,.35,x,h+.02,0,distantTrim,g)};
 pier(-3.25,3.65,.42);pier(-.55,4.72,.48);pier(2.28,2.82,.37);
 const archPiece=(x,y,span,tilt)=>{const a=mesh(new THREE.TorusGeometry(span*.5,.075,5,11,Math.PI*.74),distantTrim,x,y,.02,g);a.rotation.z=tilt;};
 archPiece(-1.9,3.84,2.35,-.07);archPiece(.82,4.87,2.1,.12);
 const fallen=box(2.25,.18,.32,4.22,.55,.02,distantStone,g);fallen.rotation.z=.29;
}

// Thin mist sheets drift behind the portal and through the outer piers.  Their
// depth is behind the gate face, and the near edge starts outside the centre
// path, so the atmosphere never hides the player or the win trigger.
const gateFogRibbons=[];
function gateFogRibbon(x,y,z,w,h,opacity,phase){
 const f=mesh(new THREE.PlaneGeometry(w,h,1,1),new THREE.MeshBasicMaterial({map:mistMap,color:'#abc9d8',transparent:true,opacity,depthWrite:false,fog:true,side:THREE.DoubleSide}),x,y,z);
 f.castShadow=false;f.receiveShadow=false;f.userData.unbatched=true;gateFogRibbons.push({f,x,opacity,phase});
}
gateFogRibbon(-2.1,1.36,-16.72,8.8,1.82,.19,.4);
gateFogRibbon(3.35,2.06,-16.88,7.2,1.42,.13,2.1);
gateFogRibbon(-11.6,1.04,-10.95,3.4,1.18,.048,4.4);
gateFogRibbon(11.8,1.22,-11.2,3.7,1.08,.044,5.6);
const valleyHaze=mesh(new THREE.PlaneGeometry(265,110),new THREE.MeshBasicMaterial({color:'#668096',transparent:true,opacity:.23,depthWrite:false,fog:false}),0,-24,-103);valleyHaze.castShadow=false;
// Batch stationary masonry by material, leaving animated pieces intact.
scene.updateMatrixWorld(true);
const batches=new Map();scene.traverse(o=>{if(!o.isMesh||o.userData.unbatched||o.material.transparent)return;let list=batches.get(o.material);if(!list)batches.set(o.material,list=[]);list.push(o)});
for(const [material,objects]of batches){if(objects.length<2)continue;const geos=objects.map(o=>{const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);g.clearGroups();g.applyMatrix4(o.matrixWorld);return g});const merged=mergeGeometries(geos,false);if(merged){const batch=new THREE.Mesh(merged,material);batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);objects.forEach(o=>o.removeFromParent())}geos.forEach(g=>g.dispose())}
const clothClock={value:0};
function drape(top,bottom,height,material,x,y,z,parent,ragged=.12){const geo=new THREE.CylinderGeometry(top,bottom,height,bottom<.15?12:36,bottom<.15?6:12,true);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),t=(height*.5-p.getY(i))/height,fold=1+Math.sin(a*11+t*.9)*.1+Math.sin(a*19)*.035;p.setX(i,p.getX(i)*fold);p.setZ(i,p.getZ(i)*fold+Math.pow(t,2)*.15);p.setY(i,p.getY(i)+Math.pow(t,8)*Math.sin(a*13)*ragged)}geo.computeVertexNormals();const m=material.clone();m.customProgramCacheKey=()=>String(height);m.onBeforeCompile=shader=>{shader.uniforms.clothTime=clothClock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float clothTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hem=clamp(0.5-position.y/'+height.toFixed(2)+',0.,1.);transformed.x+=sin(clothTime*2.4+position.y*2.+position.z*3.)*hem*hem*.075;transformed.z+=sin(clothTime*1.8+position.x*5.)*hem*.07;')};return mesh(geo,m,x,y,z,parent)}
// Cloaked traveler with a warm handheld lantern.
const player=new THREE.Group();scene.add(player);const coat=new THREE.MeshStandardMaterial({color:'#292b30',roughness:.9,side:THREE.DoubleSide});const robe=drape(.28,.63,1.5,coat,0,.95,0,player);const hood=mesh(new THREE.LatheGeometry([new THREE.Vector2(.31,0),new THREE.Vector2(.34,.18),new THREE.Vector2(.29,.4),new THREE.Vector2(.15,.62),new THREE.Vector2(.025,.7)],24),coat,0,1.49,0,player);hood.scale.set(1,1,1.1);hood.rotation.x=.13;const hoodRim=mesh(new THREE.TorusGeometry(.27,.085,8,24,Math.PI*1.65),coat,0,1.83,-.24,player);hoodRim.rotation.z=-.32;hoodRim.scale.y=1.18;box(.29,.31,.12,0,1.79,-.28,black,player);const cape=drape(.19,.68,1.5,coat,0,1.05,.15,player,.18);cape.rotation.y=-Math.PI*.85;for(const s of [-1,1]){box(.21,.35,.35,s*.2,.25,0,black,player);const arm=cylinder(.13,.15,.75,s*.4,1.23,-.03,coat,player);arm.rotation.z=s*.2}const lantern=new THREE.Group();lantern.position.set(-.61,.95,-.1);player.add(lantern);box(.2,.3,.2,0,0,0,gold,lantern);for(const x of [-.13,.13])for(const z of [-.13,.13])box(.035,.38,.035,x,0,z,bronze,lantern);box(.32,.06,.32,0,-.2,0,bronze,lantern);mesh(new THREE.ConeGeometry(.24,.17,4),bronze,0,.25,0,lantern);const handle=mesh(new THREE.TorusGeometry(.13,.022,5,12),bronze,0,.4,0,lantern);glow(0,0,0,1.3,lantern);const playerLight=new THREE.PointLight('#ffbd62',13,8,1.6);playerLight.position.set(-.6,1.5,0);player.add(playerLight);player.scale.setScalar(1.28);playerLight.distance=12;playerLight.decay=1.35;
const emberLocations=[[-8,10],[8,12],[-7,-1],[8,1],[4,-10]];const embers=emberLocations.map(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);if(i===1||i===0){box(1.2,.65,1.2,x,.32,z);box(1.45,.15,1.45,x,.72,z)}const y=(i<2?1.4:.75);const orb=mesh(new THREE.IcosahedronGeometry(.13,2),gold,0,y,0,g);const ring=mesh(new THREE.TorusGeometry(.25,.015,6,32),gold,0,y,0,g);glow(0,y,0,1.8,g);const l=new THREE.PointLight('#ffaa33',5,5,1.6);l.position.set(0,y,0);g.add(l);return{g,orb,ring,x,z,y,collected:false}});
const enemies=[];for(let i=0;i<5;i++){const g=new THREE.Group();scene.add(g);const mat=new THREE.MeshStandardMaterial({color:'#142536',transparent:true,opacity:.62,roughness:1,side:THREE.DoubleSide,depthWrite:false});const body=drape(.31,.28,1.75,mat,0,1,0,g,.28);drape(.06,.34,.65,mat,0,1.8,.03,g,.02);const face=mesh(new THREE.SphereGeometry(.21,12,10),new THREE.MeshStandardMaterial({color:'#07101a',roughness:1,transparent:true,opacity:.72}),0,1.79,-.09,g);face.scale.set(1,1.3,.75);for(const s of [-1,1]){mesh(new THREE.SphereGeometry(.044,7,6),icyEye,s*.11,1.83,-.27,g);const eyeGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:eyeGlowMap,color:'#9eefff',transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));eyeGlow.position.set(s*.11,1.83,-.31);eyeGlow.scale.set(.25,.25,1);g.add(eyeGlow)}for(let k=0;k<7;k++){let strip=drape(.07,.04,1.5,mat,Math.sin(k)*.42,.65,Math.cos(k)*.35,g,.25);strip.rotation.z=Math.sin(k)*.3}const mist=[];for(let k=0;k<6;k++){const cloud=new THREE.Sprite(new THREE.SpriteMaterial({map:mistMap,color:k<2?'#9bbbd4':'#55728e',transparent:true,opacity:k<2?.18:.12,depthWrite:false,fog:true}));const a=k/6*Math.PI*2;cloud.position.set(Math.sin(a)*(.18+k*.045),.36+k*.27,Math.cos(a)*.24+.16);cloud.scale.set(1.1+(k%3)*.35,.7+(k%2)*.45,1);g.add(cloud);mist.push(cloud)}enemies.push({g,body,mist,home:new THREE.Vector3([-6,6,-5,8,0][i],0,[6,6,-7,-8,0][i]),phase:i*1.7,repel:0})}
// Ragged hems distinguish the shadows from solid figures.
for(const e of enemies){e.g.scale.set(1.2,1.35,1.2);e.g.children.forEach(o=>{if(o.geometry?.type==='ConeGeometry'){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i));p.setX(i,p.getX(i)*(1+Math.sin(a*7)*.22));if(y<0)p.setY(i,y+Math.sin(a*13)*.2)}p.needsUpdate=true;o.geometry.computeVertexNormals()}})}
// Open, curling cloth strips break up the solid cone silhouette of each wraith.
for(const e of enemies){
 for(let k=0;k<10;k++){
  const a=k/18*Math.PI*2,geo=new THREE.PlaneGeometry(rr(.07,.18),rr(1.3,2.1),1,12),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const t=(1.1-p.getY(i))/2.2,r=.27+t*.27;p.setX(i,p.getX(i)+Math.sin(a)*r+Math.sin(t*6+a)*t*.2);p.setZ(i,Math.cos(a)*r+t*t*.45);p.setY(i,p.getY(i)+.83)}geo.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({color:k%3?'#182a3b':'#304860',roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.42,depthWrite:false});
  mat.onBeforeCompile=shader=>{shader.uniforms.clothTime=clothClock;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float clothTime;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat flutter=max(0.,1.8-position.y);transformed.x+=sin(clothTime*2.6+position.y*4.+position.z*5.)*flutter*.1;transformed.z+=cos(clothTime*2.+position.y*3.)*flutter*.1;')};mesh(geo,mat,0,0,0,e.g);
 }
 for(const sign of [-1,1]){
 const sleeve=drape(.16,.09,1.15,new THREE.MeshStandardMaterial({color:'#111c29',roughness:1,transparent:true,opacity:.8,side:THREE.DoubleSide}),sign*.45,1.2,-.15,e.g,.18);sleeve.rotation.z=sign*.52;sleeve.rotation.x=-.55;
 const hand=mesh(new THREE.SphereGeometry(.09,7,6),black,sign*.7,.79,-.45,e.g);hand.scale.set(.6,1.8,.7);
 }e.body.rotation.x=-.16;
 const haze=new THREE.Sprite(new THREE.SpriteMaterial({map:mistMap,color:'#81a9c7',transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending}));haze.position.y=.24;haze.scale.set(3.8,1.7,1);e.g.add(haze);e.mist.push(haze);
}
// Grounded mist only fills broken side joints and rain pools at the gate's feet.
// Each patch has a chipped outline, reads from the ground plane, and leaves the
// central lane from the player to the portal completely clean.
const groundFogs=[];function groundFogPatch(x,z,rx,rz,base,phase,turn){const g=new THREE.CircleGeometry(1,13),a=g.attributes.position;for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i),edge=1+.16*Math.sin(i*4.7+phase)+.09*Math.cos(i*8.2+x);a.setXY(i,px*edge,py*edge)}g.computeVertexNormals();const m=new THREE.MeshBasicMaterial({map:mistMap,color:'#b7d9e7',transparent:true,opacity:base,depthWrite:false,side:THREE.DoubleSide,fog:true});const f=mesh(g,m,x,.075,z);f.rotation.set(-Math.PI/2,0,turn);f.scale.set(rx,rz,1);f.castShadow=false;f.receiveShadow=false;groundFogs.push({f,base,phase,rx,rz})}
for(const spec of [[-6.35,-12.72,1.42,.62,.09,.2,.18],[6.48,-12.65,1.34,.58,.084,1.3,-.24],[-8.5,-13.78,1.08,.45,.057,2.6,.38],[8.55,-13.62,.98,.42,.053,3.7,-.26],[-10.02,-10.72,1.02,.39,.043,4.5,.08],[9.9,-10.46,.84,.34,.039,5.3,-.42],[-7.78,-8.85,.7,.28,.034,6.1,.21],[7.7,-9.05,.78,.3,.035,6.9,-.15]])groundFogPatch(...spec);
const dustCount=220,dustPos=new Float32Array(dustCount*3);for(let i=0;i<dustCount;i++){dustPos[i*3]=rr(-15,15);dustPos[i*3+1]=rr(.2,8);dustPos[i*3+2]=rr(-18,20)}const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPos,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#d2c1a2',size:.035,transparent:true,opacity:.5,depthWrite:false}));scene.add(dust);
const pulseRing=mesh(new THREE.RingGeometry(.92,1,80),new THREE.MeshBasicMaterial({color:'#ffd08a',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),0,.16,0);pulseRing.rotation.x=-Math.PI/2;
let light=100,count=0,status='playing',cooldown=0,pulseAge=99,time=0,toastTimer=0,yaw=-.14,pitch=.37,distance=30,drag=false,lastX=0,lastY=0,audioOn=true,audioCtx=null,ambientNodes=[];
const keys=new Set(),stick={x:0,y:0};let last=performance.now();const camTarget=new THREE.Vector3(0,2.15,2);const demoMode=new URLSearchParams(location.search).has('demo');if(demoMode)renderer.toneMappingExposure=1.4;
function setAmbient(active){if(!active){ambientNodes.forEach(n=>{try{n.stop()}catch{}});ambientNodes=[];return}if(ambientNodes.length)return;audioCtx??=new AudioContext();audioCtx.resume();for(const [frequency,volume,detune] of [[49,.025,-7],[73.42,.018,6],[110,.009,-4]]){const oscillator=audioCtx.createOscillator(),gain=audioCtx.createGain(),lfo=audioCtx.createOscillator(),lfoGain=audioCtx.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;oscillator.detune.value=detune;gain.gain.value=volume;lfo.frequency.value=.045+frequency*.00011;lfoGain.gain.value=volume*.42;lfo.connect(lfoGain).connect(gain.gain);oscillator.connect(gain).connect(audioCtx.destination);oscillator.start();lfo.start();ambientNodes.push(oscillator,lfo)}}function tone(freq,duration=.25,type='sine',volume=.05){if(!audioOn)return;audioCtx??=new AudioContext();audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.65,audioCtx.currentTime+duration);g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}
function toast(msg){$('toast').textContent=msg;$('toast').style.opacity=1;toastTimer=3}
function updateHud(){$('count').textContent=count;$('percent').textContent=Math.ceil(light)+'%';$('lightbar').style.width=light+'%';$('lightbar').parentElement.setAttribute('aria-valuenow',Math.ceil(light));$('pulseText').textContent=cooldown>0?Math.ceil(cooldown)+'s':'SPACE';$('pulse').disabled=cooldown>0||status!=='playing';$('objective').textContent=count===5?'Đánh thức cổng cổ':'Tìm năm ember';$('hint').textContent=count===5?'Đi vào vòm cổng đang phát sáng':'Mang ánh lửa về cổng cổ';$('danger').textContent=light<25?'Đèn sắp cạn. Tìm ember để hồi sáng.':'Bóng tối đang lắng nghe.'}
function modal(mode){status=mode;keys.clear();stick.x=stick.y=0;drag=false;touchPoints.clear();$('stick').firstElementChild.style.transform='';$('resume').textContent='Tiếp tục hành trình';$('modal').hidden=mode==='playing';$('resume').hidden=mode==='won'||mode==='lost';$('modalTitle').textContent=mode==='won'?'Cổng cổ đã thức tỉnh.':mode==='lost'?'Ánh lửa đã tắt.':'Tạm dừng hành trình';$('modalBody').textContent=mode==='won'?'Năm ember hợp thành một ngọn lửa. Cổng cổ mở ra, và hơi ấm trở lại với vùng đất này.':mode==='lost'?'Bóng tối đã nuốt ánh đèn. Nhặt ember để hồi sáng, và dùng xung đèn lồng trước khi bị vây quanh.':'Tìm năm ember trong sân đổ nát, rồi đi vào cổng cổ. Né bóng tối hoặc dùng xung đèn lồng để đẩy chúng ra. Ember hồi ánh đèn; xung miễn phí và hồi sau 7 giây.';updateHud()}
function restart(){time=0;light=100;count=0;cooldown=0;pulseAge=99;yaw=-.14;pitch=.37;distance=30;camTarget.set(0,2.15,2.04);pulseRing.material.opacity=0;toastTimer=0;$('toast').style.opacity=0;$('vignette').style.boxShadow='inset 0 0 180px #02081188';player.position.set(0,0,13.5);player.rotation.y=0;embers.forEach(e=>{e.collected=false;e.g.visible=true});enemies.forEach(e=>{e.g.position.copy(e.home);e.repel=0});portal.material.opacity=0;gateLight.intensity=0;modal('playing');updateHud()}
function pulse(){if(status!=='playing'||cooldown>0)return;cooldown=7;pulseAge=0;pulseRing.position.set(player.position.x,.19,player.position.z);for(const e of enemies)if(e.g.position.distanceTo(player.position)<7)e.repel=3.5;tone(160,.8,'sine',.12);toast('Xung đèn lồng đẩy lùi bóng tối.');updateHud()}
$('pause').onclick=()=>modal(status==='paused'?'playing':'paused');$('resume').onclick=()=>{modal('playing');setAmbient(audioOn)};$('restart').onclick=restart;$('pulse').onclick=pulse;$('audio').onclick=()=>{audioOn=!audioOn;setAmbient(audioOn);$('audio').textContent='Âm thanh: '+(audioOn?'bật':'tắt');$('audio').setAttribute('aria-pressed',String(audioOn));tone(420)};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){if(status==='playing'||status==='paused')modal(status==='paused'?'playing':'paused')}else if(e.code==='KeyR')restart();else if(e.code==='Space')pulse();else keys.add(e.code)});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{if(status==='playing')modal('paused')});document.addEventListener('visibilitychange',()=>{if(document.hidden&&status==='playing')modal('paused')});
renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(!drag||touchPoints.size>1)return;yaw-=(e.clientX-lastX)*.005;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,.36,1.1);lastX=e.clientX;lastY=e.clientY});renderer.domElement.addEventListener('pointerup',()=>drag=false);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.016,15,39)},{passive:false});
const touchPoints=new Map();let pinchDistance=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});pinchDistance=0}});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!touchPoints.has(e.pointerId))return;touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touchPoints.size===2){const [a,b]=[...touchPoints.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance)distance=THREE.MathUtils.clamp(distance-(d-pinchDistance)*.05,18,42);pinchDistance=d;drag=false}});
for(const ev of ['pointerup','pointercancel'])renderer.domElement.addEventListener(ev,e=>{touchPoints.delete(e.pointerId);pinchDistance=0;drag=false});
const pad=$('stick');function moveStick(e){const r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/36,y=(e.clientY-r.top-r.height/2)/36,l=Math.max(1,Math.hypot(x,y));stick.x=x/l;stick.y=y/l;pad.firstElementChild.style.transform=`translate(${stick.x*30}px,${stick.y*30}px)`}pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);moveStick(e)});pad.addEventListener('pointermove',e=>{if(pad.hasPointerCapture(e.pointerId))moveStick(e)});for(const ev of ['pointerup','pointercancel'])pad.addEventListener(ev,()=>{stick.x=stick.y=0;pad.firstElementChild.style.transform=''});
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)});
function movePlayer(dt){if(demoMode){const route=[[0,0,13.5],[2.1,-8,10],[5,8,12],[7.9,-7,-1],[10.8,8,1],[13.7,4,-10],[17.2,0,-13.7]];let target=route.at(-1);for(const point of route)if(time<point[0]){target=point;break}player.position.lerp(new THREE.Vector3(target[1],0,target[2]),Math.min(1,dt*2.3));return}let x=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+stick.x,z=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+stick.y;const len=Math.hypot(x,z);if(len<.05){robe.rotation.z*=.9;return}x/=Math.max(1,len);z/=Math.max(1,len);const dx=(x*Math.cos(yaw)+z*Math.sin(yaw))*4.5*dt,dz=(-x*Math.sin(yaw)+z*Math.cos(yaw))*4.5*dt;const p=player.position;p.x=THREE.MathUtils.clamp(p.x+dx,-11.2,11.2);p.z=THREE.MathUtils.clamp(p.z+dz,-14.7,18.3);for(const o of obstacles){let ax=p.x-o.x,az=p.z-o.z,d=Math.hypot(ax,az),r=o.r+.34;if(d<r&&d>.001){p.x=o.x+ax/d*r;p.z=o.z+az/d*r}}player.rotation.y=Math.atan2(-dx,-dz);robe.rotation.z=Math.sin(time*11)*.035;cape.rotation.x=Math.sin(time*8)*.07;lantern.rotation.z=Math.sin(time*9)*.07}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.04);last=now;if(status==='playing'){time+=dt;clothClock.value=time;cooldown=Math.max(0,cooldown-dt);toastTimer-=dt;if(toastTimer<=0)$('toast').style.opacity=0;movePlayer(dt);let danger=false;for(const e of enemies){e.repel=Math.max(0,e.repel-dt);const d=e.g.position.distanceTo(player.position);let target=e.home.clone().add(new THREE.Vector3(Math.sin(time*.24+e.phase)*3,0,Math.cos(time*.2+e.phase)*3));let speed=.8;if(d<5.3){target.copy(player.position);speed=1.3}let dir=target.sub(e.g.position);dir.y=0;if(e.repel>0){dir.copy(e.g.position).sub(player.position);dir.y=0;speed=3.2}if(e.repel>0&&dir.length()<.15){dir.set(Math.sin(e.phase),0,Math.cos(e.phase))}if(dir.length()>.15){dir.normalize();e.g.position.addScaledVector(dir,speed*dt);e.g.rotation.y=Math.atan2(-dir.x,-dir.z)}e.g.position.x=THREE.MathUtils.clamp(e.g.position.x,-11,11);e.g.position.z=THREE.MathUtils.clamp(e.g.position.z,-13.5,18);e.body.rotation.z=Math.sin(time*2+e.phase)*.08;e.g.position.y=Math.sin(time*2+e.phase)*.1;e.mist.forEach((cloud,k)=>{const wave=time*(.65+k*.09)+e.phase+k*1.7;cloud.position.x+=Math.sin(wave)*dt*.055;cloud.position.z+=Math.cos(wave*1.2)*dt*.035;cloud.position.y+=Math.sin(wave*1.7)*dt*.04;const swell=1+Math.sin(wave)*.09;cloud.scale.set((k===6?3.8:1.1+(k%3)*.35)*swell,(k===6?1.7:.7+(k%2)*.45)*swell,1);cloud.material.opacity=(k===6?.2:k<2?.18:.12)*(.78+Math.sin(wave)*.18)});if(d<1.7&&e.repel<=0){light-=11*dt;danger=true}}groundFogs.forEach(({f,base,phase})=>{f.material.opacity=base*(.72+Math.sin(time*.42+phase)*.22);f.rotation.z=Math.sin(time*.18+phase)*.035});gateFogRibbons.forEach(({f,x,opacity,phase})=>{f.position.x=x+Math.sin(time*.19+phase)*.72;f.position.y+=Math.sin(time*.31+phase)*dt*.035;f.material.opacity=opacity*(.72+Math.sin(time*.33+phase)*.2)});light=Math.max(0,light-.3*dt);for(const e of embers){if(e.collected)continue;e.orb.position.y=e.y+Math.sin(time*2)*.09;e.ring.rotation.y=time*.8;if(Math.hypot(player.position.x-e.x,player.position.z-e.z)<1.15){e.collected=true;e.g.visible=false;count++;light=Math.min(100,light+23);tone(450+count*95,.6);toast(count===5?'Đã đủ năm ember. Hãy trở về cổng cổ.':`Ember ${count} / 5 · Đã hồi ánh đèn`)}}if(count===5){portal.material.opacity=.17+Math.sin(time)*.04;gateLight.intensity=22;if(Math.hypot(player.position.x,player.position.z+14)<2.2){tone(700,1.8);modal('won')}}if(light<=0)modal('lost');playerLight.intensity=(11+light*.075)*(1+Math.sin(time*9)*.04);$('vignette').style.boxShadow=danger?'inset 0 0 180px #651f38aa':'inset 0 0 180px #02081188';pulseAge+=dt;pulseRing.material.opacity=Math.max(0,1-pulseAge/1.1)*.8;pulseRing.scale.setScalar(1+pulseAge*7);for(const {f,l,phase}of fires){f.scale.set(1+Math.sin(time*8+phase)*.12,1+Math.sin(time*11+phase)*.18,1);l.intensity=6+Math.sin(time*9+phase)}updateHud()}
const close=THREE.MathUtils.clamp((30-distance)/15,0,1);const followX=Math.max(.35+.65*close,camera.aspect<.8?.9:.35);const desired=new THREE.Vector3(player.position.x*followX,2.15,player.position.z*(.28+.72*close)-1.35);camTarget.lerp(desired,.035);camera.position.set(camTarget.x+Math.sin(yaw)*distance*Math.cos(pitch),camTarget.y+Math.sin(pitch)*distance,camTarget.z+Math.cos(yaw)*distance*Math.cos(pitch));camera.lookAt(camTarget);composer.render()}
Object.defineProperty(window,'emberfall',{get:()=>Object.freeze({status,light,count,cooldown,audioOn,audioState:audioCtx?.state??'off',elapsed:time,screen:(()=>{const p=player.position.clone();p.y=1.3;p.project(camera);return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}})(),player:{x:player.position.x,z:player.position.z},embers:embers.map(e=>({x:e.x,z:e.z,collected:e.collected})),enemies:enemies.map(e=>({x:e.g.position.x,z:e.g.position.z,repelled:e.repel>0})),gate:{x:0,z:-14},camera:{yaw,pitch,distance}})});
restart();if(demoMode){audioOn=false;modal('playing')}else{modal('paused');$('modalTitle').textContent='Đánh thức cổng cổ';$('resume').textContent='Bắt đầu hành trình'}requestAnimationFrame(frame);


