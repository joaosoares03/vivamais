// Local fallback on Windows. Docker uses the native Tesseract executable.
import { createWorker, PSM } from 'tesseract.js';
import { resolve } from 'node:path';
const image=process.argv[2];if(!image)process.exit(2);
const worker=await createWorker('eng',1,{cachePath:process.env.OCR_CACHE_DIRECTORY||resolve('.local/ocr-cache'),...(process.env.OCR_DATA_DIRECTORY?{langPath:process.env.OCR_DATA_DIRECTORY}:{}),logger:()=>{}});
try{await worker.setParameters({tessedit_pageseg_mode:PSM.SINGLE_BLOCK});const result=await worker.recognize(image);process.stdout.write(JSON.stringify({text:result.data.text,confidence:result.data.confidence/100}));}finally{await worker.terminate();}
