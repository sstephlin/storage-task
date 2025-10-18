import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync } from "fs";

// Initialize Firebase
initializeApp({
  credential: cert("./serviceAccountKey.json"),
});

const db = getFirestore();

// Convert timestamps to ISO format
const formatTimestamps = (obj) => {
  const formatted = { ...obj };
  for (const key in formatted) {
    if (formatted[key] instanceof Date) {
      formatted[key] = formatted[key]
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
    } else if (
      typeof formatted[key] === "number" &&
      key.toLowerCase().includes("time")
    ) {
      formatted[key] = new Date(formatted[key])
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);
    }
  }
  return formatted;
};

// Helper: Convert array to CSV
const toCSV = (rows) => {
  if (!rows.length) return "";
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");
};

async function exportData() {
  const userSnapshot = await db.collection("user_sessions").get();

  const buttonRows = [];
  const vialRows = [];
  const sessionMetaRows = [];

  for (const userDoc of userSnapshot.docs) {
    const userId = userDoc.id;
    const sessionsSnapshot = await db
      .collection("user_sessions")
      .doc(userId)
      .collection("sessions")
      .get();

    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionId = sessionDoc.id;
      const sessionData = formatTimestamps(sessionDoc.data());

      // BUTTON PRESSES
      const buttonSnapshot = await db
        .collection("user_sessions")
        .doc(userId)
        .collection("sessions")
        .doc(sessionId)
        .collection("button_presses")
        .get();

      for (const pressDoc of buttonSnapshot.docs) {
        buttonRows.push(
          formatTimestamps({
            userId,
            sessionId,
            ...pressDoc.data(),
          })
        );
      }

      // VIAL SNAPSHOTS
      const vialSnapshot = await db
        .collection("user_sessions")
        .doc(userId)
        .collection("sessions")
        .doc(sessionId)
        .collection("vial_snapshots")
        .get();

      for (const vialDoc of vialSnapshot.docs) {
        vialRows.push(
          formatTimestamps({
            userId,
            sessionId,
            ...vialDoc.data(),
          })
        );
      }

      // SESSION META
      sessionMetaRows.push({
        userId,
        sessionId,
        ...sessionData,
      });
    }
  }

  // 📝 Write separate CSV files
  if (buttonRows.length) {
    writeFileSync("button_presses.csv", toCSV(buttonRows));
    console.log("Exported button_presses.csv");
  }

  if (vialRows.length) {
    writeFileSync("vial_snapshots.csv", toCSV(vialRows));
    console.log("Exported vial_snapshots.csv");
  }

  if (sessionMetaRows.length) {
    writeFileSync("session_meta.csv", toCSV(sessionMetaRows));
    console.log("Exported session_meta.csv");
  }

  console.log("Finished exporting all CSV files!");
}

exportData().catch(console.error);
