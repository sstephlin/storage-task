import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync } from "fs";
import fs from "fs";

// Initialize Firebase with your service account
initializeApp({
  credential: cert("./scripts/serviceAccountKey.json"),
});

const db = getFirestore();

async function exportData() {
  const snapshot = await db.collection("user_sessions").get();
  const rows = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    rows.push({
      participant_id: data.participant_id,
      timestamp: data.timestamp,
      ...flatten(data.data), // optional helper for nested data
    });
  });

  // Convert to CSV
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");

  writeFileSync("firestore_export.csv", csv);
  console.log("Exported to firestore_export.csv");
}

function flatten(obj, prefix = "") {
  if (obj === null || obj === undefined) {
    return { [prefix.slice(0, -1)]: obj };
  }

  if (typeof obj !== "object") {
    return { [prefix.slice(0, -1)]: obj };
  }

  return Object.entries(obj).reduce((acc, [k, v]) => {
    Object.assign(acc, flatten(v, `${prefix}${k}_`));
    return acc;
  }, {});
}

exportData();
