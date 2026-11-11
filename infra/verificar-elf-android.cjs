const fs = require("node:fs"), path = require("node:path");
const diretorio=path.resolve(process.argv[2]??""),destino=path.resolve(process.argv[3]??"");
if(process.argv.length!==4)throw new Error("Informe o diretório das bibliotecas arm64 extraídas e o arquivo JSON de evidência.");
const resultados=[];
for(const nome of fs.readdirSync(diretorio).filter(n=>n.endsWith(".so"))){
 const bytes=fs.readFileSync(path.join(diretorio,nome));
 if(bytes.subarray(0,4).toString("hex")!=="7f454c46"||bytes[4]!==2||bytes[5]!==1||bytes.readUInt16LE(18)!==183)throw new Error("ELF arm64 inesperado.");
 const inicio=Number(bytes.readBigUInt64LE(32)),tamanho=bytes.readUInt16LE(54),quantidade=bytes.readUInt16LE(56),segmentos=[];
 for(let i=0;i<quantidade;i++){const p=inicio+i*tamanho;if(bytes.readUInt32LE(p)===1){const alinhamento=Number(bytes.readBigUInt64LE(p+48)),deslocamento=Number(bytes.readBigUInt64LE(p+8)),virtual=Number(bytes.readBigUInt64LE(p+16));segmentos.push({alinhamento,compativel16kb:alinhamento>=16384&&deslocamento%16384===virtual%16384});}}
 resultados.push({biblioteca:nome,segmentos,compativel16kb:segmentos.length>0&&segmentos.every(s=>s.compativel16kb)});
}
const evidencia={formato:"ELF64 little endian, arm64",bibliotecas:resultados.length,alinhamento16kb:resultados.length>0&&resultados.every(r=>r.compativel16kb),resultados};
fs.mkdirSync(path.dirname(destino),{recursive:true});fs.writeFileSync(destino,JSON.stringify(evidencia,null,2));console.log(JSON.stringify({bibliotecas:evidencia.bibliotecas,alinhamento16kb:evidencia.alinhamento16kb}));if(!evidencia.alinhamento16kb)process.exitCode=1;
