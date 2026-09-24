import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PROGRAMS, CENTERS, NOTICES, WHY_FIITJEE_POINTS } from '../src/data/fiitjeeData';
import { ADMISSION_EXAMS } from '../src/data/examsData';

interface ResultItem {
  name: string;
  category: string;
  rank: string;
  rank_heading?: string;
  description?: string;
  image_url?: string;
  local_image_path?: string;
}

const categoryMap: Record<string, string> = {
  'jee-advanced-2025': 'JEE Advanced 2025',
  'jee-main-2025': 'JEE Main 2025',
  'jee-advanced-2024': 'JEE Advanced 2024',
  'jee-main-2024': 'JEE Main 2024',
  'olympiads-2024': 'Olympiads 2024'
};

async function start() {
  console.log("Loading results.json...");
  const resultsPath = path.resolve('results.json');
  const rawResults: ResultItem[] = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

  console.log(`Mapping ${rawResults.length} toppers data...`);
  const mappedToppers = rawResults.map((item, idx) => {
    let imageUrl = '';

    if (item.local_image_path) {
      const normalizedPath = item.local_image_path.replace(/\\/g, '/');
      const diskPath = path.resolve('public', normalizedPath);

      if (fs.existsSync(diskPath)) {
        imageUrl = '/' + normalizedPath;
      } else {
        imageUrl = item.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`;
      }
    } else {
      imageUrl = item.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`;
    }

    const yearMatch = item.category.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '2025';

    return {
      id: `topper-${idx}`,
      name: item.name,
      rank: item.rank,
      exam: categoryMap[item.category] || item.category,
      year: year,
      program: item.description || 'Classroom Program',
      image: imageUrl
    };
  });

  // Create full JSON payload
  const databasePayload = {
    programs: PROGRAMS,
    toppers: mappedToppers,
    centers: CENTERS,
    notices: NOTICES,
    why_fiitjee_points: WHY_FIITJEE_POINTS,
    admission_exams: ADMISSION_EXAMS
  };

  const payloadPath = path.resolve('database_payload.json');
  fs.writeFileSync(payloadPath, JSON.stringify(databasePayload, null, 2));
  console.log(`Saved dynamic database payload to ${payloadPath}`);

  // Deploy to Firebase Realtime Database
  console.log("Deploying mapping to Firebase Realtime Database...");
  try {
    execSync(`firebase database:set / "${payloadPath}" --force`, { stdio: 'inherit' });
    console.log("Firebase Realtime Database successfully uploaded with all 198 toppers!");
  } catch (err: any) {
    console.error("Firebase CLI database deployment failed:", err.message);
  }
}

start().then(() => {
  console.log("Done.");
  process.exit(0);
});
