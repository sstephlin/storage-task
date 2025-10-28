import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync } from "fs";

// Initialize Firebase
initializeApp({
  credential: cert("./serviceAccountKey.json"),
});

const db = getFirestore();

// Convert Firestore timestamps to readable format
const formatTimestamp = (value) => {
  if (!value) return "";

  // Handle Firestore Timestamp objects
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate().toISOString().replace("T", " ").slice(0, 19);
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString().replace("T", " ").slice(0, 19);
  }

  // Handle millisecond timestamps
  if (typeof value === "number" && value > 1000000000000) {
    return new Date(value).toISOString().replace("T", " ").slice(0, 19);
  }

  return value;
};

// Flatten nested objects for CSV (e.g., gameState.vial1Level -> gameState_vial1Level)
const flattenObject = (obj, prefix = "") => {
  const flattened = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = "";
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !value.toDate
    ) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (
      key.toLowerCase().includes("time") ||
      key === "startTime" ||
      key === "endTime" ||
      key === "updatedAt"
    ) {
      flattened[newKey] = formatTimestamp(value);
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
};

// Escape CSV values properly
const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

// Helper: Convert array to CSV with proper escaping
const toCSV = (rows) => {
  if (!rows.length) return "";

  // Get all unique headers from all rows
  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  // Sort headers for consistency (put userId and sessionId first)
  const sortedHeaders = headers.sort((a, b) => {
    if (a === "userId") return -1;
    if (b === "userId") return 1;
    if (a === "sessionId") return -1;
    if (b === "sessionId") return 1;
    return a.localeCompare(b);
  });

  const headerRow = sortedHeaders.map(escapeCSV).join(",");
  const dataRows = rows.map((row) =>
    sortedHeaders.map((h) => escapeCSV(row[h] ?? "")).join(",")
  );

  return [headerRow, ...dataRows].join("\n");
};

async function exportData() {
  try {
    console.log("Starting export...");

    const userSnapshot = await db.collection("user_sessions").get();
    console.log(`Found ${userSnapshot.size} users`);

    const buttonRows = [];
    const vialRows = [];
    const sessionMetaRows = [];

    for (const userDoc of userSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`Processing user: ${userId}`);

      const sessionsSnapshot = await db
        .collection("user_sessions")
        .doc(userId)
        .collection("sessions")
        .orderBy("startTime", "asc") // Order sessions chronologically
        .get();

      console.log(`  Found ${sessionsSnapshot.size} sessions`);

      for (const sessionDoc of sessionsSnapshot.docs) {
        const sessionId = sessionDoc.id;
        const sessionData = sessionDoc.data();

        // BUTTON PRESSES
        try {
          const buttonSnapshot = await db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("button_presses")
            .orderBy("timestampMs", "asc") // Order by timestamp
            .get();

          console.log(
            `    Session ${sessionId}: ${buttonSnapshot.size} button presses`
          );

          for (const pressDoc of buttonSnapshot.docs) {
            const pressData = pressDoc.data();
            // Flatten the nested gameState object
            const flattened = flattenObject({
              userId,
              sessionId,
              ...pressData,
            });
            buttonRows.push(flattened);
          }
        } catch (error) {
          console.error(
            `    Error fetching button presses for session ${sessionId}:`,
            error.message
          );
        }

        // VIAL SNAPSHOTS
        try {
          const vialSnapshot = await db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("vial_snapshots")
            .orderBy("timestampMs", "asc") // Order by timestamp
            .get();

          console.log(
            `    Session ${sessionId}: ${vialSnapshot.size} vial snapshots`
          );

          for (const vialDoc of vialSnapshot.docs) {
            const vialData = vialDoc.data();
            const flattened = flattenObject({
              userId,
              sessionId,
              ...vialData,
            });
            vialRows.push(flattened);
          }
        } catch (error) {
          console.error(
            `    Error fetching vial snapshots for session ${sessionId}:`,
            error.message
          );
        }

        // SESSION META
        const flattenedSession = flattenObject({
          userId,
          sessionId,
          ...sessionData,
        });
        sessionMetaRows.push(flattenedSession);
      }
    }

    // 📝 Write separate CSV files
    console.log("\nWriting CSV files...");

    if (buttonRows.length) {
      writeFileSync("button_presses.csv", toCSV(buttonRows));
      console.log(`✓ Exported button_presses.csv (${buttonRows.length} rows)`);
    } else {
      console.log("⚠ No button presses found");
    }

    if (vialRows.length) {
      writeFileSync("vial_snapshots.csv", toCSV(vialRows));
      console.log(`✓ Exported vial_snapshots.csv (${vialRows.length} rows)`);
    } else {
      console.log("⚠ No vial snapshots found");
    }

    if (sessionMetaRows.length) {
      writeFileSync("session_meta.csv", toCSV(sessionMetaRows));
      console.log(
        `✓ Exported session_meta.csv (${sessionMetaRows.length} rows)`
      );
    } else {
      console.log("⚠ No session metadata found");
    }

    console.log("\n✅ Finished exporting all CSV files!");
  } catch (error) {
    console.error("❌ Error during export:", error);
    throw error;
  }
}

exportData().catch(console.error);
