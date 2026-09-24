import fs from 'fs';
import path from 'path';

const homedir = process.env.USERPROFILE || process.env.HOME || '';
const configPath = path.join(homedir, '.config', 'configstore', 'firebase-tools.json');

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const accessToken = config.tokens.access_token;
  const project = 'fiitjee-online';

  fetch(`https://storage.googleapis.com/storage/v1/b?project=${project}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("Storage Buckets:", JSON.stringify(data, null, 2));
  });
} catch (err: any) {
  console.error("Error:", err.message);
}
