export const HEROES = [
{id:'cat',name:'Astro Cat',ja:'宇宙ネコ',tag:'Cosmic slacker',desc:'A little explorer with a big appetite for crystals.',style:'Collect from farther away.',weak:'An all-rounder, not a tank.',hp:100,speed:6.8,magnet:1.35,dashCD:2.4,color:'#eea146'},
{id:'frog',name:'Frog Fighter',ja:'カエルファイター',tag:'Punchy buddy',desc:'Red gloves. Green attitude. No backing down.',style:'Dash through a crowd for 135 damage.',weak:'Average crystal reach.',hp:130,speed:6.8,dashDamage:135,color:'#92c73c'},
{id:'shroom',name:'Mushroom Hero',ja:'キノコヒーロー',tag:'Small but brave',desc:'A tiny cape and a surprisingly speedy pair of feet.',style:'Fast movement and a 1.8s dash.',weak:'Only 90 starting health.',hp:90,speed:7.6,dashCD:1.8,color:'#ed6654'},
{id:'capybara',name:'Chill Capybara',ja:'のんびりカピバラ',tag:'Just vibing',desc:'Still in the hot spring. Still unbothered.',style:'160 health and a generous magnet.',weak:'Slow movement and dash recovery.',hp:160,speed:5.8,magnet:1.15,dashCD:3,dashDamage:110,color:'#bd8a60'},
{id:'ramen',name:'Ramen Ronin',ja:'ラーメン浪人',tag:'Hot bowl. Cool moves.',desc:'A wandering warrior with lunch to protect.',style:'Quick feet and powerful dashes.',weak:'Modest health reserve.',hp:105,speed:7.2,dashCD:2.2,dashDamage:120,color:'#e9b858'},
{id:'penguin',name:'Office Penguin',ja:'会社員ペンギン',tag:'Clocking out',desc:'The tie stays on. The gloves come off.',style:'Dash again every 1.5 seconds.',weak:'80 health. Avoid contact.',hp:80,speed:7.1,dashCD:1.5,dashDamage:75,color:'#789eae'},
{id:'axolotl',name:'Axolotl',ja:'ウーパールーパー',tag:'Crystal collector',desc:'Pink, curious, and impossible to miss.',style:'The largest crystal magnet: ×1.6.',weak:'Low health and dash damage.',hp:85,speed:7.3,magnet:1.6,dashDamage:75,color:'#e99eb8'},
{id:'avocado',name:'Avo Boxer',ja:'アボカドボクサー',tag:'Built to brawl',desc:'A heavyweight with a heart of stone.',style:'130 dash damage, 120 health.',weak:'A little slower on the mat.',hp:120,speed:6.4,dashCD:2.1,dashDamage:130,color:'#a0b844'},
{id:'robot',name:'Clockwork Bot',ja:'ゼンマイロボ',tag:'All wound up',desc:'Tin shell. Brass heart. Maximum mayhem.',style:'Devastating 165-damage dash.',weak:'Longer dash cooldown.',hp:115,speed:6.2,dashCD:2.8,dashDamage:165,color:'#81b8bc'},
{id:'snail',name:'Snail Knight',ja:'カタツムリ騎士',tag:'Slow and steady',desc:'Home is wherever the battle is.',style:'190 health: the toughest toy.',weak:'The slowest hero.',hp:190,speed:5.2,magnet:1.2,dashCD:3.2,dashDamage:120,color:'#b9a2d1'}
].map(h=>({magnet:1,dashCD:2.4,dashDamage:90,...h}));
export const WEAPONS = [
{id:'sardine',type:'orbit',name:'Sardine Chainsaw',ja:'イワシチェーンソー',count:3,radius:2.9,damage:1,speed:1.2,desc:'Three fish. Constant close-range slicing.',weak:'You must get close.'},
{id:'cactus',type:'orbit',name:'Cactus Club',ja:'サボテンクラブ',count:2,radius:3.3,damage:1.65,speed:.78,hitRadius:1.25,knock:1.5,desc:'Two clubs with extra reach and impact.',weak:'Slow rotation leaves gaps.'},
{id:'plunger',type:'orbit',name:'Plunger Patrol',ja:'スッポンパトロール',count:4,radius:2.25,damage:.85,speed:1.5,desc:'Four plungers keep the crowd at bay.',weak:'Short reach.'},
{id:'banana',type:'return',name:'Banana Blades',ja:'バナナブレード',count:2,damage:1,speed:1.25,desc:'Twin blades sweep out and return home.',weak:'A gap between each sweep.'},
{id:'pizza',type:'return',name:'Pizza Cutter',ja:'ピザカッター',count:1,damage:1.5,speed:.82,hitRadius:1.65,desc:'A big wheel that cuts through a crowd.',weak:'Slow return.'},
{id:'croissant',type:'return',name:'Croissant Blades',ja:'クロワッサンブレード',count:3,damage:.75,speed:1.45,desc:'Three buttery blades cover a wide fan.',weak:'Light individual hits.'},
{id:'boomerang',type:'return',name:'Boomerang',ja:'ブーメラン',count:1,damage:1.15,speed:1.6,desc:'A fast, precise returning arc.',weak:'One narrow path.'},
{id:'donut-disc',type:'return',name:'Donut Disc',ja:'ドーナツディスク',count:1,damage:1.5,speed:.9,hitRadius:1.3,desc:'A heavy ring of frosted destruction.',weak:'Slow to come back.'},
{id:'duck',type:'shoot',name:'Duck Rocket',ja:'アヒルロケット',count:1,damage:2,speed:1,interval:.42,homing:true,aoe:2,desc:'Homing ducks with an explosive finish.',weak:'Less effective against scattered toys.'},
{id:'toaster',type:'shoot',name:'Angry Toaster',ja:'怒れるトースター',count:3,damage:.7,speed:1,interval:.65,pierce:true,desc:'Three piercing slices in a wide fan.',weak:'Individual slices hit lightly.'},
{id:'teapot',type:'shoot',name:'Raging Teapot',ja:'暴走ティーポット',count:2,damage:2.8,speed:1,interval:.8,aoe:2.8,desc:'Two slow shots. Big splash damage.',weak:'Slow projectiles.'},
{id:'bubble-gun',type:'shoot',name:'Bubble Gun',ja:'バブルガン',count:2,damage:.45,speed:1,interval:.3,pierce:true,desc:'A constant stream of piercing bubbles.',weak:'Low damage per bubble.'}
].map(w=>({hitRadius:.8,knock:.6,...w}));
export const heroById=id=>HEROES.find(h=>h.id===id)||HEROES[0];
export const weaponById=id=>WEAPONS.find(w=>w.id===id)||WEAPONS[3];
export const ENEMIES={ 'red-chomper':{hp:30,speed:2.35,radius:.65,damage:9,xp:1},'spring-rabbit':{hp:23,speed:3.5,radius:.55,damage:9,xp:1},'crown-bear':{hp:130,speed:1.7,radius:.95,damage:18,xp:3}};
export const DEFAULT_LOADOUT={hero:'cat',return:'banana',shoot:'toaster'};
export const UPGRADES={orbit:{name:'Orbital Overload',ja:'軌道オーバーロード',desc:'+1 orbiting toy (max 7), +22% damage.'},return:{name:'One More Round',ja:'もう一周',desc:'Faster returns, more reach, +22% power.'},shoot:{name:'Full Send',ja:'全力射撃',desc:'Faster shots, +20% damage, more projectiles.'},life:{name:'Live a Little',ja:'今を楽しもう',desc:'+10% movement speed, +30 maximum health.'}};
