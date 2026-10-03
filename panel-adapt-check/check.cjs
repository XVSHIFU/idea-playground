const fs=require('fs');const katex=require('katex');
const tests=JSON.parse(fs.readFileSync(__dirname+'/tests.json','utf8'));
console.warn=()=>{};
let errors=[];
for(const t of tests){
 // Dimension placeholders are instructions to substitute values, not literal TeX lengths.
 let expr=t.expr.replace(/\[[^\]]+\](?=cm|em|pt)/g,'1').replace(/\{[XY]cm\}/g,'{1cm}');
 expr=expr.replace(/(\\(?:textcolor|colorbox)\{)\[[^\]]+\](\})/g,'$1#333333$2');
 try{katex.renderToString(expr,{throwOnError:true,strict:'ignore',displayMode:true});}
 catch(e){errors.push({...t,error:e.message});}
}
fs.writeFileSync(__dirname+'/errors.json',JSON.stringify(errors,null,2));
console.log(JSON.stringify({tested:tests.length,errors:errors.length}));
for(const e of errors)console.log(e.file+' #'+e.index+' '+e.error);
