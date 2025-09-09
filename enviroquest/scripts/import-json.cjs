// scripts/import-json.cjs
const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("../eco-shaala-cae9c-firebase-adminsdk-fbsvc-14c2120c52.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const filePath = "./quizes.json";
const rawData = fs.readFileSync(filePath);
const jsonData = JSON.parse(rawData);

(async () => {
  try {
    for (const section of jsonData.sections) {
      const docRef = await db.collection("quiz_sections").add(section);
      console.log(`✅ Added section: ${section.level} with ID: ${docRef.id}`);
    }
    console.log("🎉 Import complete!");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error importing:", e);
    process.exit(1);
  }
})();
