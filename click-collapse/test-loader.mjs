import {pathToFileURL} from 'node:url';
export async function resolve(specifier,context,next){
 if(specifier==='cannon-es'){
  if(!process.env.CANNON_ES_PATH)throw Error('Set CANNON_ES_PATH to cannon-es 0.20.0 ESM file (.mjs)');
  return {url:pathToFileURL(process.env.CANNON_ES_PATH).href,shortCircuit:true};
 }
 return next(specifier,context);
}
