import fs from 'fs';
import path from 'path';

interface ResultItem {
  name: string;
  category: string;
  rank: string;
  rank_heading?: string;
  description?: string;
  image_url?: string;
  local_image_path?: string;
}

const resultsPath = path.resolve('results.json');
const results: ResultItem[] = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

let existCount = 0;
let missingCount = 0;

for (const item of results) {
  if (item.local_image_path) {
    const normalizedPath = item.local_image_path.replace(/\\/g, '/');
    const fullPath = path.resolve(normalizedPath);
    if (fs.existsSync(fullPath)) {
      existCount++;
    } else {
      missingCount++;
    }
  } else {
    missingCount++;
  }
}

console.log(`Results.json check:`);
console.log(`Total items in JSON: ${results.length}`);
console.log(`Photos found on disk: ${existCount}`);
console.log(`Photos missing on disk: ${missingCount}`);
