import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PROGRAMS, TOPPERS, CENTERS, NOTICES, WHY_FIITJEE_POINTS } from '../src/data/fiitjeeData';

async function start() {
  console.log("Converting topper images to base64...");
  const updatedToppers = [...TOPPERS];

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < updatedToppers.length; i++) {
    const topper = updatedToppers[i];
    const imagePath = topper.image;

    // Check if it's a local file path
    if (imagePath && (imagePath.startsWith('student_photos/') || imagePath.startsWith('/student_photos/'))) {
      const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const fullPath = path.resolve(relativePath);

      if (fs.existsSync(fullPath)) {
        try {
          const fileBuffer = fs.readFileSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase();
          let mimeType = 'image/png';
          if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
          else if (ext === '.webp') mimeType = 'image/webp';
          else if (ext === '.svg') mimeType = 'image/svg+xml';

          const base64Data = fileBuffer.toString('base64');
          topper.image = `data:${mimeType};base64,${base64Data}`;
          successCount++;
        } catch (err: any) {
          console.error(`Failed to encode ${topper.name} photo:`, err.message);
        }
      } else {
        console.warn(`Local photo not found on disk: ${fullPath}`);
        skipCount++;
      }
    } else {
      skipCount++;
    }
  }

  console.log(`Base64 encoding progress done. Encoded: ${successCount}, Skipped: ${skipCount}`);

  // Create full JSON payload
  const databasePayload = {
    programs: PROGRAMS,
    toppers: updatedToppers,
    centers: CENTERS,
    notices: NOTICES,
    why_fiitjee_points: WHY_FIITJEE_POINTS
  };

  const payloadPath = path.resolve('database_payload.json');
  fs.writeFileSync(payloadPath, JSON.stringify(databasePayload, null, 2));
  console.log(`Saved database payload with Base64 images to ${payloadPath}`);

  // Deploy to Firebase Realtime Database using the active logged-in CLI credentials
  console.log("Deploying payload with base64 images to Firebase Realtime Database...");
  try {
    execSync(`firebase database:set / "${payloadPath}" --force`, { stdio: 'inherit' });
    console.log("Firebase Realtime Database upload successful!");
  } catch (err: any) {
    console.error("Firebase CLI database deployment failed:", err.message);
  }
}

start().then(() => {
  console.log("Done.");
  process.exit(0);
});
