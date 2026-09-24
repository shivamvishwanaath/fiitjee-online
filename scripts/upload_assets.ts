import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { PROGRAMS, TOPPERS, CENTERS, NOTICES, WHY_FIITJEE_POINTS } from '../src/data/fiitjeeData';

// 1. Read access token from local firebase-tools config
const homedir = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(homedir, '.config', 'configstore', 'firebase-tools.json');
let accessToken = '';

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  accessToken = config.tokens.access_token;
  console.log("Successfully retrieved Firebase access token.");
} catch (err: any) {
  console.error("Failed to load Firebase CLI token:", err.message);
  process.exit(1);
}

const bucket = 'fiitjee-online.appspot.com';

// Helper function to upload file using GCS JSON API with CI access token
async function uploadFile(filePath: string, destination: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';

  const encodedDest = encodeURIComponent(destination);
  const uuid = crypto.randomUUID();

  // POST request for media upload
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodedDest}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': contentType
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed for ${destination}: ${response.statusText} (${errorText})`);
  }

  // PATCH request to update metadata with firebaseStorageDownloadTokens (for public view)
  const metadataUrl = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodedDest}`;
  const patchResponse = await fetch(metadataUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      metadata: {
        firebaseStorageDownloadTokens: uuid
      }
    })
  });

  if (!patchResponse.ok) {
    const errorText = await patchResponse.text();
    throw new Error(`Metadata update failed for ${destination}: ${patchResponse.statusText} (${errorText})`);
  }

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedDest}?alt=media&token=${uuid}`;
}

async function start() {
  console.log("Scanning student toppers images...");
  const updatedToppers = [...TOPPERS];
  const uploadedUrls = new Map<string, string>();

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
        if (uploadedUrls.has(relativePath)) {
          // Use cached URL if already uploaded in this run
          topper.image = uploadedUrls.get(relativePath)!;
          skipCount++;
        } else {
          console.log(`Uploading [${i + 1}/${updatedToppers.length}] ${topper.name} (${relativePath})...`);
          try {
            const downloadUrl = await uploadFile(fullPath, relativePath);
            uploadedUrls.set(relativePath, downloadUrl);
            topper.image = downloadUrl;
            successCount++;
          } catch (err: any) {
            console.error(`Failed to upload ${topper.name} photo:`, err.message);
          }
        }
      } else {
        console.warn(`Local photo not found on disk: ${fullPath}`);
      }
    } else {
      skipCount++;
    }
  }

  console.log(`Upload progress done. Uploaded: ${successCount}, Reused/Skipped: ${skipCount}`);

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
  console.log(`Saved database payload to ${payloadPath}`);

  // Deploy to Firebase Realtime Database using the active logged-in CLI credentials
  console.log("Deploying payload to Firebase Realtime Database...");
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
