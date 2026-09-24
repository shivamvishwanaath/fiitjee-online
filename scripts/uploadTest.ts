import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyALyLS1XTbgAmgea3ifsZm5RzrtU6B-WPk",
  authDomain: "fiitjee-online.firebaseapp.com",
  databaseURL: "https://fiitjee-online-default-rtdb.firebaseio.com",
  projectId: "fiitjee-online",
  storageBucket: "fiitjee-online.firebasestorage.app",
  messagingSenderId: "880773462295",
  appId: "1:880773462295:web:67f8fd68065edbfd021f52"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

async function test() {
  console.log("Testing connection...");
  try {
    // Try writing to DB
    await set(dbRef(db, "test_write"), { timestamp: Date.now(), msg: "Hello from local script" });
    console.log("DB Write Succeeded!");
  } catch (err: any) {
    console.error("DB Write Failed:", err.message);
  }

  try {
    // Try uploading to Storage
    const buffer = Buffer.from("Hello world storage");
    const testRef = storageRef(storage, "test.txt");
    await uploadBytes(testRef, buffer);
    const url = await getDownloadURL(testRef);
    console.log("Storage Upload Succeeded! Download URL:", url);
  } catch (err: any) {
    console.error("Storage Upload Failed:", err.message);
  }
}

test().then(() => process.exit(0));
