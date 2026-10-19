// Run with Node 22+: node --experimental-loader ./click-collapse/test-loader.mjs
// click-collapse/test-physics.mjs. Set CANNON_ES_PATH to a downloaded copy of
// cannon-es@0.20.0/dist/cannon-es.js (named .mjs). Nothing is installed at runtime.
import assert from 'node:assert/strict';
import {makeLevel,replay,Simulation,G,DT} from './shared.js';
let passed=0;
for(let i=0;i<24;i++)for(let turn=0;turn<4;turn++){
 const seed=turn?2400+turn*24+i:1000+i,l=makeLevel(i,seed);
 assert.ok(l.parts.filter(p=>p.mass).length<=18);
 assert.ok(l.parts.filter(p=>p.handle).length<=2);
 for(const route of l.routes){const r=replay(l,route);assert.equal(r.snapshot.result,'success',`${i+1}/${turn}/${route.name}`);assert.ok(r.maxHandForce<=3*G+1e-8);passed++;}
}
// Cut is queued, then graph and constraint disappear together; a hinge survives.
const s=new Simulation(makeLevel(12));const joint=s.joints.find(j=>j.id==='pinA');assert.ok(s.cut('pinA'));assert.ok(joint.active);s.step();assert.equal(joint.active,false);assert.ok(!s.world.constraints.includes(joint.constraint));assert.ok(s.world.constraints.includes(s.joints.find(j=>j.id==='pivotL').constraint));
assert.ok(s.grab('tray'));const p=s.handlePoint('tray');assert.ok(s.cut('pinA')===false);const q=s.byId.get('tray').quaternion.clone(),velocity=s.byId.get('tray').velocity.clone();s.release();assert.deepEqual(s.byId.get('tray').quaternion,q);assert.deepEqual(s.byId.get('tray').velocity,velocity);
// Heavy direct hit fails; a normal pad landing wins under the same material rules.
const heavy=new Simulation(makeLevel(10));for(const j of heavy.joints)if(j.removable)heavy.cut(j.id);for(let i=0;i<600&&heavy.result==='playing';i++)heavy.step();assert.equal(heavy.result,'failed');
// Same initial seed and input produce same major trajectory in this engine.
const l=makeLevel(20);assert.deepEqual(replay(l,l.routes[0]),replay(l,l.routes[0]));
console.log(`${passed} route/rotation replays passed; atomic cut, retained hinge, finite hand, release continuity, heavy-hit failure, same-seed repeat passed.`);
