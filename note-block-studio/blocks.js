import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

// Face order follows Three.js: right, left, top, bottom, front, back.
export const BLOCK_APPEARANCES = [
 {sides:'grass-side',top:'grass-top',bottom:'dirt'},
 {sides:'wood',top:'wood-top',bottom:'wood-top'},
 {sides:'stone'},
 {sides:'sand'},
 {sides:'glass',glass:true},
 {sides:'gold'},
 {sides:'clay'},
 {sides:'glowstone'}
];

export function buildBlockGeometry(row,width=.82,height=width){
 const appearance=BLOCK_APPEARANCES[row];
 const faceTextures=[appearance.sides,appearance.sides,appearance.top||appearance.sides,appearance.bottom||appearance.sides,appearance.sides,appearance.sides];
 const textureNames=[...new Set(faceTextures)];
 const original=new RoundedBoxGeometry(width,height,width,1,.008);
 const geometry=new THREE.BufferGeometry();
 // Combine faces sharing a texture, keeping both original UV orientation and
 // instancing. Grass uses three draw groups, logs two, uniform blocks one.
 const order=[];
 for(let materialIndex=0;materialIndex<textureNames.length;materialIndex++){
  const start=order.length;
  faceTextures.forEach((name,face)=>{
   if(name!==textureNames[materialIndex])return;
   const group=original.groups[face];
   for(let vertex=group.start;vertex<group.start+group.count;vertex++)order.push(vertex);
  });
  geometry.addGroup(start,order.length-start,materialIndex);
 }
 for(const [name,attribute] of Object.entries(original.attributes)){
  const values=new Float32Array(attribute.array.length);
  order.forEach((source,index)=>{
   for(let component=0;component<attribute.itemSize;component++)values[index*attribute.itemSize+component]=attribute.array[source*attribute.itemSize+component];
  });
  geometry.setAttribute(name,new THREE.BufferAttribute(values,attribute.itemSize,attribute.normalized));
 }
 original.dispose();
 geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return {geometry,textureNames,appearance};
}
