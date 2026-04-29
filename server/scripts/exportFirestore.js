// // import { initializeApp, cert } from "firebase-admin/app";
// // import { getFirestore } from "firebase-admin/firestore";
// // import { writeFileSync } from "fs";

// // // Initialize Firebase
// // initializeApp({
// //   credential: cert("./serviceAccountKey.json"),
// // });

// // const db = getFirestore();

// // // Convert Firestore timestamps to readable format
// // const formatTimestamp = (value) => {
// //   if (!value) return "";

// //   // Handle Firestore Timestamp objects
// //   if (value.toDate && typeof value.toDate === "function") {
// //     return value.toDate().toISOString().replace("T", " ").slice(0, 19);
// //   }

// //   // Handle Date objects
// //   if (value instanceof Date) {
// //     return value.toISOString().replace("T", " ").slice(0, 19);
// //   }

// //   // Handle millisecond timestamps
// //   if (typeof value === "number" && value > 1000000000000) {
// //     return new Date(value).toISOString().replace("T", " ").slice(0, 19);
// //   }

// //   return value;
// // };

// // // Flatten nested objects for CSV (e.g., gameState.vial1Level -> gameState_vial1Level)
// // const flattenObject = (obj, prefix = "") => {
// //   const flattened = {};

// //   for (const key in obj) {
// //     const value = obj[key];
// //     const newKey = prefix ? `${prefix}_${key}` : key;

// //     if (value === null || value === undefined) {
// //       flattened[newKey] = "";
// //     } else if (
// //       typeof value === "object" &&
// //       !Array.isArray(value) &&
// //       !(value instanceof Date) &&
// //       !value.toDate
// //     ) {
// //       // Recursively flatten nested objects
// //       Object.assign(flattened, flattenObject(value, newKey));
// //     } else if (
// //       key.toLowerCase().includes("time") ||
// //       key === "startTime" ||
// //       key === "endTime" ||
// //       key === "updatedAt" ||
// //       key === "timestamp"
// //     ) {
// //       flattened[newKey] = formatTimestamp(value);
// //     } else {
// //       flattened[newKey] = value;
// //     }
// //   }

// //   return flattened;
// // };

// // // Escape CSV values properly
// // const escapeCSV = (value) => {
// //   if (value === null || value === undefined) return "";

// //   const str = String(value);

// //   // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
// //   if (str.includes(",") || str.includes('"') || str.includes("\n")) {
// //     return `"${str.replace(/"/g, '""')}"`;
// //   }

// //   return str;
// // };

// // // Helper: Convert array to CSV with proper escaping
// // const toCSV = (rows) => {
// //   if (!rows.length) return "";

// //   // Get all unique headers from all rows
// //   const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

// //   // Sort headers for consistency (put important fields first)
// //   const sortedHeaders = headers.sort((a, b) => {
// //     if (a === "userId") return -1;
// //     if (b === "userId") return 1;
// //     if (a === "sessionId") return -1;
// //     if (b === "sessionId") return 1;
// //     if (a === "roundNumber") return -1;
// //     if (b === "roundNumber") return 1;
// //     if (a === "msSinceGameStart") return -1;
// //     if (b === "msSinceGameStart") return 1;
// //     if (a === "msSinceRoundStart") return -1;
// //     if (b === "msSinceRoundStart") return 1;
// //     if (a === "buttonType") return -1;
// //     if (b === "buttonType") return 1;
// //     return a.localeCompare(b);
// //   });

// //   const headerRow = sortedHeaders.map(escapeCSV).join(",");
// //   const dataRows = rows.map((row) =>
// //     sortedHeaders.map((h) => escapeCSV(row[h] ?? "")).join(",")
// //   );

// //   return [headerRow, ...dataRows].join("\n");
// // };

// // async function exportData() {
// //   try {
// //     console.log("Starting export...");

// //     const userSnapshot = await db.collection("user_sessions").get();
// //     console.log(`Found ${userSnapshot.size} users`);

// //     const buttonRows = [];
// //     const sessionMetaRows = [];
// //     const roundStartRows = [];

// //     for (const userDoc of userSnapshot.docs) {
// //       const userId = userDoc.id;
// //       console.log(`Processing user: ${userId}`);

// //       const sessionsSnapshot = await db
// //         .collection("user_sessions")
// //         .doc(userId)
// //         .collection("sessions")
// //         .orderBy("startTime", "asc") // Order sessions chronologically
// //         .get();

// //       console.log(`  Found ${sessionsSnapshot.size} sessions`);

// //       for (const sessionDoc of sessionsSnapshot.docs) {
// //         const sessionId = sessionDoc.id;
// //         const sessionData = sessionDoc.data();

// //         // BUTTON PRESSES
// //         try {
// //           const buttonSnapshot = await db
// //             .collection("user_sessions")
// //             .doc(userId)
// //             .collection("sessions")
// //             .doc(sessionId)
// //             .collection("button_presses")
// //             .orderBy("msSinceGameStart", "asc") // Order by game time
// //             .get();

// //           console.log(
// //             `    Session ${sessionId}: ${buttonSnapshot.size} button presses`
// //           );

// //           for (const pressDoc of buttonSnapshot.docs) {
// //             const pressData = pressDoc.data();
// //             // Flatten the nested gameState object
// //             const flattened = flattenObject({
// //               userId,
// //               sessionId,
// //               ...pressData,
// //             });
// //             buttonRows.push(flattened);
// //           }
// //         } catch (error) {
// //           console.error(
// //             `    Error fetching button presses for session ${sessionId}:`,
// //             error.message
// //           );
// //         }

// //         // ROUND STARTS
// //         try {
// //           const roundSnapshot = await db
// //             .collection("user_sessions")
// //             .doc(userId)
// //             .collection("sessions")
// //             .doc(sessionId)
// //             .collection("round_starts")
// //             .orderBy("msSinceGameStart", "asc") // Order by game time
// //             .get();

// //           console.log(
// //             `    Session ${sessionId}: ${roundSnapshot.size} round starts`
// //           );

// //           for (const roundDoc of roundSnapshot.docs) {
// //             const roundData = roundDoc.data();
// //             const flattened = flattenObject({
// //               userId,
// //               sessionId,
// //               ...roundData,
// //             });
// //             roundStartRows.push(flattened);
// //           }
// //         } catch (error) {
// //           console.error(
// //             `    Error fetching round starts for session ${sessionId}:`,
// //             error.message
// //           );
// //         }

// //         // SESSION META
// //         const flattenedSession = flattenObject({
// //           userId,
// //           sessionId,
// //           ...sessionData,
// //         });
// //         sessionMetaRows.push(flattenedSession);
// //       }
// //     }

// //     // 📝 Write separate CSV files
// //     console.log("\nWriting CSV files...");

// //     if (buttonRows.length) {
// //       writeFileSync("button_presses.csv", toCSV(buttonRows));
// //       console.log(`✓ Exported button_presses.csv (${buttonRows.length} rows)`);
// //     } else {
// //       console.log("⚠ No button presses found");
// //     }

// //     if (roundStartRows.length) {
// //       writeFileSync("round_starts.csv", toCSV(roundStartRows));
// //       console.log(
// //         `✓ Exported round_starts.csv (${roundStartRows.length} rows)`
// //       );
// //     } else {
// //       console.log("⚠ No round starts found");
// //     }

// //     if (sessionMetaRows.length) {
// //       writeFileSync("session_meta.csv", toCSV(sessionMetaRows));
// //       console.log(
// //         `✓ Exported session_meta.csv (${sessionMetaRows.length} rows)`
// //       );
// //     } else {
// //       console.log("⚠ No session metadata found");
// //     }

// //     console.log("\n✅ Finished exporting all CSV files!");
// //     console.log("\nExported files:");
// //     console.log(
// //       "  • button_presses.csv - All button press events with game state"
// //     );
// //     console.log(
// //       "  • round_starts.csv - Round start timestamps and configurations"
// //     );
// //     console.log(
// //       "  • session_meta.csv - Session metadata with setpoints and timestamps"
// //     );
// //   } catch (error) {
// //     console.error("❌ Error during export:", error);
// //     throw error;
// //   }
// // }

// // exportData().catch(console.error);
// // exportData.mjs
// // Run with: node exportData.mjs
// // Requires: ./serviceAccountKey.json

// import { initializeApp, cert } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import { writeFileSync } from "fs";

// initializeApp({ credential: cert("./serviceAccountKey.json") });
// const db = getFirestore();

// // ============================================================================
// // UTILITIES
// // ============================================================================

// const formatTimestamp = (value) => {
//   if (!value) return "";
//   if (value.toDate && typeof value.toDate === "function")
//     return value.toDate().toISOString().replace("T", " ").slice(0, 23);
//   if (value instanceof Date)
//     return value.toISOString().replace("T", " ").slice(0, 23);
//   if (typeof value === "number" && value > 1_000_000_000_000)
//     return new Date(value).toISOString().replace("T", " ").slice(0, 23);
//   return value;
// };

// const TIMESTAMP_KEYS = new Set([
//   "timestamp",
//   "startTime",
//   "endTime",
//   "updatedAt",
//   "roundEndTime",
//   "prelimAnsweredAt",
//   "completedAt",
//   "completionTimestamp",
// ]);

// const flattenObject = (obj, prefix = "") => {
//   const out = {};
//   for (const [key, value] of Object.entries(obj)) {
//     const newKey = prefix ? `${prefix}_${key}` : key;
//     if (value === null || value === undefined) {
//       out[newKey] = "";
//     } else if (
//       TIMESTAMP_KEYS.has(key) ||
//       (typeof value === "object" && value?.toDate)
//     ) {
//       out[newKey] = formatTimestamp(value);
//     } else if (
//       typeof value === "object" &&
//       !Array.isArray(value) &&
//       !(value instanceof Date)
//     ) {
//       Object.assign(out, flattenObject(value, newKey));
//     } else if (Array.isArray(value)) {
//       out[newKey] = JSON.stringify(value);
//     } else {
//       out[newKey] = value;
//     }
//   }
//   return out;
// };

// const escapeCSV = (value) => {
//   if (value === null || value === undefined) return "";
//   const str = String(value);
//   return str.includes(",") || str.includes('"') || str.includes("\n")
//     ? `"${str.replace(/"/g, '""')}"`
//     : str;
// };

// // Priority columns appear first in the CSV, in this order
// const PRIORITY_COLS = [
//   "userId",
//   "sessionId",
//   "gameVersion",
//   "isTrainingMode",
//   "roundNumber",
//   "roundDocId",
//   "msSinceSessionStart",
//   "msSinceRoundStart",
//   "msSinceLastPress",
//   "timestamp",
// ];

// const toCSV = (rows) => {
//   if (!rows.length) return "";
//   const allKeys = Array.from(new Set(rows.flatMap(Object.keys)));
//   const priority = PRIORITY_COLS.filter((k) => allKeys.includes(k));
//   const rest = allKeys
//     .filter((k) => !PRIORITY_COLS.includes(k))
//     .sort((a, b) => a.localeCompare(b));
//   const headers = [...priority, ...rest];
//   const headerRow = headers.map(escapeCSV).join(",");
//   const dataRows = rows.map((row) =>
//     headers.map((h) => escapeCSV(row[h] ?? "")).join(","),
//   );
//   return [headerRow, ...dataRows].join("\n");
// };

// const write = (filename, rows) => {
//   if (!rows.length) {
//     console.log(`  ⚠  No data for ${filename}`);
//     return;
//   }
//   writeFileSync(filename, toCSV(rows));
//   console.log(`  ✓  ${filename}  (${rows.length} rows)`);
// };

// // ============================================================================
// // PAGINATED FETCH
// // Firestore Admin can silently truncate large collections.
// // This fetches all documents in batches of `pageSize` to guarantee completeness.
// // ============================================================================

// const PAGE_SIZE = 200;

// /**
//  * Fetch ALL documents from a query, paginating automatically.
//  * @param {FirebaseFirestore.Query} query - Must have an orderBy so startAfter works
//  * @returns {Promise<FirebaseFirestore.QueryDocumentSnapshot[]>}
//  */
// async function fetchAll(query) {
//   const docs = [];
//   let cursor = null;

//   while (true) {
//     const page = cursor
//       ? await query.startAfter(cursor).limit(PAGE_SIZE).get()
//       : await query.limit(PAGE_SIZE).get();

//     docs.push(...page.docs);

//     if (page.docs.length < PAGE_SIZE) break; // last page
//     cursor = page.docs[page.docs.length - 1];
//   }

//   return docs;
// }

// // ============================================================================
// // MAIN EXPORT
// // ============================================================================

// async function exportData() {
//   console.log("Starting export…\n");

//   // Accumulators — one array per CSV output file
//   const sessionRows = []; // one row per session (metadata + completion + prelim)
//   const tutorialSlideRows = []; // one row per slide navigation event
//   const tutorialQuizRows = []; // one row per quiz answer submission
//   const roundRows = []; // one row per round (start + end merged)
//   const buttonPressRows = []; // one row per button press

//   // ── Users ────────────────────────────────────────────────────────────────
//   // user_sessions docs are keyed by userId (string) — order by documentId()
//   const userDocs = await fetchAll(
//     db.collection("user_sessions").orderBy("__name__"),
//   );
//   console.log(`Found ${userDocs.length} users.`);

//   for (const userDoc of userDocs) {
//     const userId = userDoc.id;
//     process.stdout.write(`  Processing ${userId}… `);

//     // ── Sessions ────────────────────────────────────────────────────────────
//     const sessionDocs = await fetchAll(
//       db
//         .collection("user_sessions")
//         .doc(userId)
//         .collection("sessions")
//         .orderBy("startTime", "asc"),
//     );

//     process.stdout.write(`${sessionDocs.length} session(s)\n`);

//     for (const sessionDoc of sessionDocs) {
//       const sessionId = sessionDoc.id;
//       const sessionData = sessionDoc.data();

//       // Flatten top-level session doc (includes prelimAnswer, completion, etc.)
//       sessionRows.push(flattenObject({ userId, sessionId, ...sessionData }));

//       const base = {
//         userId,
//         sessionId,
//         gameVersion: sessionData.gameVersion ?? "",
//       };

//       // ── Tutorial slide events ─────────────────────────────────────────────
//       try {
//         const slideDocs = await fetchAll(
//           db
//             .collection("user_sessions")
//             .doc(userId)
//             .collection("sessions")
//             .doc(sessionId)
//             .collection("tutorial_slides")
//             .orderBy("timestamp", "asc"),
//         );
//         for (const slideDoc of slideDocs) {
//           tutorialSlideRows.push(
//             flattenObject({
//               ...base,
//               slideDocId: slideDoc.id,
//               ...slideDoc.data(),
//             }),
//           );
//         }
//       } catch (e) {
//         console.error(
//           `    Error fetching tutorial_slides for ${sessionId}:`,
//           e.message,
//         );
//       }

//       // ── Tutorial quiz answers ─────────────────────────────────────────────
//       try {
//         const quizDocs = await fetchAll(
//           db
//             .collection("user_sessions")
//             .doc(userId)
//             .collection("sessions")
//             .doc(sessionId)
//             .collection("tutorial_quiz_answers")
//             .orderBy("timestamp", "asc"),
//         );
//         for (const quizDoc of quizDocs) {
//           tutorialQuizRows.push(
//             flattenObject({
//               ...base,
//               quizDocId: quizDoc.id,
//               ...quizDoc.data(),
//             }),
//           );
//         }
//       } catch (e) {
//         console.error(
//           `    Error fetching tutorial_quiz_answers for ${sessionId}:`,
//           e.message,
//         );
//       }

//       // ── Rounds ────────────────────────────────────────────────────────────
//       // Each round doc contains start + end data merged into one document.
//       // Button presses live in a subcollection under each round doc.
//       try {
//         const roundDocs = await fetchAll(
//           db
//             .collection("user_sessions")
//             .doc(userId)
//             .collection("sessions")
//             .doc(sessionId)
//             .collection("rounds")
//             .orderBy("roundNumber", "asc"),
//         );

//         for (const roundDoc of roundDocs) {
//           const roundDocId = roundDoc.id;
//           const roundData = roundDoc.data();

//           roundRows.push(flattenObject({ ...base, roundDocId, ...roundData }));

//           // ── Button presses (nested under each round) ───────────────────────
//           try {
//             const pressDocs = await fetchAll(
//               db
//                 .collection("user_sessions")
//                 .doc(userId)
//                 .collection("sessions")
//                 .doc(sessionId)
//                 .collection("rounds")
//                 .doc(roundDocId)
//                 .collection("button_presses")
//                 .orderBy("msSinceRoundStart", "asc"),
//             );
//             for (const pressDoc of pressDocs) {
//               buttonPressRows.push(
//                 flattenObject({
//                   ...base,
//                   roundDocId,
//                   roundNumber: roundData.roundNumber ?? "",
//                   isTrainingMode: roundData.isTrainingMode ?? "",
//                   pressDocId: pressDoc.id,
//                   ...pressDoc.data(),
//                 }),
//               );
//             }
//           } catch (e) {
//             console.error(
//               `    Error fetching button_presses for round ${roundDocId}:`,
//               e.message,
//             );
//           }
//         }
//       } catch (e) {
//         console.error(`    Error fetching rounds for ${sessionId}:`, e.message);
//       }
//     }
//   }

//   // ── Write CSVs ────────────────────────────────────────────────────────────
//   console.log("\nWriting CSV files…");
//   write("sessions.csv", sessionRows);
//   write("tutorial_slides.csv", tutorialSlideRows);
//   write("tutorial_quizzes.csv", tutorialQuizRows);
//   write("rounds.csv", roundRows);
//   write("button_presses.csv", buttonPressRows);

//   console.log("\nDone! Files written:");
//   console.log(
//     "  sessions.csv        — one row per session; includes prelim answer & completion data",
//   );
//   console.log("  tutorial_slides.csv — one row per slide navigation event");
//   console.log("  tutorial_quizzes.csv— one row per quiz answer submission");
//   console.log("  rounds.csv          — one row per round (config + outcome)");
//   console.log(
//     "  button_presses.csv  — one row per key press, nested under its round",
//   );
// }

// exportData().catch((e) => {
//   console.error("Export failed:", e);
//   process.exit(1);
// });
// exportData.mjs
// Run with: node exportData.mjs
// Requires: ./serviceAccountKey.json

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { writeFileSync } from "fs";

initializeApp({ credential: cert("./serviceAccountKey.json") });
const db = getFirestore();

// ============================================================================
// UTILITIES
// ============================================================================

const formatTimestamp = (value) => {
  if (!value) return "";
  if (value.toDate && typeof value.toDate === "function")
    return value.toDate().toISOString().replace("T", " ").slice(0, 23);
  if (value instanceof Date)
    return value.toISOString().replace("T", " ").slice(0, 23);
  if (typeof value === "number" && value > 1_000_000_000_000)
    return new Date(value).toISOString().replace("T", " ").slice(0, 23);
  return value;
};

const TIMESTAMP_KEYS = new Set([
  "timestamp",
  "startTime",
  "endTime",
  "updatedAt",
  "roundEndTime",
  "prelimAnsweredAt",
  "completedAt",
  "completionTimestamp",
]);

const flattenObject = (obj, prefix = "") => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    if (value === null || value === undefined) {
      out[newKey] = "";
    } else if (
      TIMESTAMP_KEYS.has(key) ||
      (typeof value === "object" && value?.toDate)
    ) {
      out[newKey] = formatTimestamp(value);
    } else if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(out, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      out[newKey] = JSON.stringify(value);
    } else {
      out[newKey] = value;
    }
  }
  return out;
};

const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

const PRIORITY_COLS = [
  "userId",
  "sessionId",
  "gameVersion",
  "isTrainingMode",
  "roundNumber",
  "roundDocId",
  "msSinceSessionStart",
  "msSinceRoundStart",
  "msSinceLastPress",
  "timestamp",
];

const toCSV = (rows) => {
  if (!rows.length) return "";
  const allKeys = Array.from(new Set(rows.flatMap(Object.keys)));
  const priority = PRIORITY_COLS.filter((k) => allKeys.includes(k));
  const rest = allKeys
    .filter((k) => !PRIORITY_COLS.includes(k))
    .sort((a, b) => a.localeCompare(b));
  const headers = [...priority, ...rest];
  const headerRow = headers.map(escapeCSV).join(",");
  const dataRows = rows.map((row) =>
    headers.map((h) => escapeCSV(row[h] ?? "")).join(","),
  );
  return [headerRow, ...dataRows].join("\n");
};

const write = (filename, rows) => {
  if (!rows.length) {
    console.log(`  ⚠  No data for ${filename}`);
    return;
  }
  writeFileSync(filename, toCSV(rows));
  console.log(`  ✓  ${filename}  (${rows.length} rows)`);
};

// ============================================================================
// PAGINATED FETCH
// ============================================================================

const PAGE_SIZE = 200;

async function fetchAll(query) {
  const docs = [];
  let cursor = null;
  while (true) {
    const page = cursor
      ? await query.startAfter(cursor).limit(PAGE_SIZE).get()
      : await query.limit(PAGE_SIZE).get();
    docs.push(...page.docs);
    if (page.docs.length < PAGE_SIZE) break;
    cursor = page.docs[page.docs.length - 1];
  }
  return docs;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

async function exportData() {
  console.log("Starting export…\n");

  const sessionRows = [];
  const tutorialSlideRows = [];
  const tutorialQuizRows = [];
  const roundRows = [];
  const buttonPressRows = [];
  const gasStationRows = [];
  const tabEventRows = [];

  // ── Users ─────────────────────────────────────────────────────────────────
  const userDocs = await fetchAll(
    db.collection("user_sessions").orderBy("__name__"),
  );
  console.log(`Found ${userDocs.length} users\n`);

  for (const userDoc of userDocs) {
    const userId = userDoc.id;
    process.stdout.write(`  Processing ${userId}… `);

    const sessionDocs = await fetchAll(
      db
        .collection("user_sessions")
        .doc(userId)
        .collection("sessions")
        .orderBy("startTime", "asc"),
    );
    process.stdout.write(`${sessionDocs.length} session(s)\n`);

    for (const sessionDoc of sessionDocs) {
      const sessionId = sessionDoc.id;
      const sessionData = sessionDoc.data();

      // Session row — flattening handles nested objects so these all become
      // top-level columns automatically:
      //   instructionsResult_passed, instructionsResult_msSinceSessionStart …
      //   trainingResult_passed, trainingResult_roundsSurvived, trainingResult_survivalRate …
      //   termination_reason, termination_stage …
      //   completion_finalScore, completion_reachedBonusGoal …
      //   prelimAnswer, prelimAnsweredAt …
      sessionRows.push(flattenObject({ userId, sessionId, ...sessionData }));

      const base = {
        userId,
        sessionId,
        gameVersion: sessionData.gameVersion ?? "",
      };

      // ── Tutorial slides ──────────────────────────────────────────────────
      try {
        const docs = await fetchAll(
          db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("tutorial_slides")
            .orderBy("timestamp", "asc"),
        );
        for (const d of docs)
          tutorialSlideRows.push(
            flattenObject({ ...base, slideDocId: d.id, ...d.data() }),
          );
      } catch (e) {
        console.error(
          `    Error fetching tutorial_slides for ${sessionId}:`,
          e.message,
        );
      }

      // ── Tutorial quiz answers ────────────────────────────────────────────
      try {
        const docs = await fetchAll(
          db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("tutorial_quiz_answers")
            .orderBy("timestamp", "asc"),
        );
        for (const d of docs)
          tutorialQuizRows.push(
            flattenObject({ ...base, quizDocId: d.id, ...d.data() }),
          );
      } catch (e) {
        console.error(
          `    Error fetching tutorial_quiz_answers for ${sessionId}:`,
          e.message,
        );
      }

      // ── Gas station toggle events ────────────────────────────────────────
      // Columns: isNowActive (1=green/on, 0=grey/off), roundNumber, roundDocId,
      //          isTrainingMode, msSinceSessionStart, msSinceRoundStart, timestamp
      try {
        const docs = await fetchAll(
          db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("gas_station_events")
            .orderBy("timestamp", "asc"),
        );
        for (const d of docs)
          gasStationRows.push(
            flattenObject({ ...base, gasEventDocId: d.id, ...d.data() }),
          );
      } catch (e) {
        console.error(
          `    Error fetching gas_station_events for ${sessionId}:`,
          e.message,
        );
      }

      // ── Tab visibility events ────────────────────────────────────────────
      // Columns: visibilityState ("hidden"|"visible"), stage, roundNumber,
      //          msSinceSessionStart, msSinceRoundStart, timestamp
      try {
        const docs = await fetchAll(
          db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("tab_events")
            .orderBy("timestamp", "asc"),
        );
        for (const d of docs)
          tabEventRows.push(
            flattenObject({ ...base, tabEventDocId: d.id, ...d.data() }),
          );
      } catch (e) {
        console.error(
          `    Error fetching tab_events for ${sessionId}:`,
          e.message,
        );
      }

      // ── Rounds ────────────────────────────────────────────────────────────
      try {
        const roundDocs = await fetchAll(
          db
            .collection("user_sessions")
            .doc(userId)
            .collection("sessions")
            .doc(sessionId)
            .collection("rounds")
            .orderBy("roundNumber", "asc"),
        );

        for (const roundDoc of roundDocs) {
          const roundDocId = roundDoc.id;
          const roundData = roundDoc.data();

          roundRows.push(flattenObject({ ...base, roundDocId, ...roundData }));

          // ── Button presses ─────────────────────────────────────────────
          // New column: gasStationActive (1 = pump green, 0 = pump grey)
          try {
            const pressDocs = await fetchAll(
              db
                .collection("user_sessions")
                .doc(userId)
                .collection("sessions")
                .doc(sessionId)
                .collection("rounds")
                .doc(roundDocId)
                .collection("button_presses")
                .orderBy("msSinceRoundStart", "asc"),
            );
            for (const d of pressDocs) {
              buttonPressRows.push(
                flattenObject({
                  ...base,
                  roundDocId,
                  roundNumber: roundData.roundNumber ?? "",
                  isTrainingMode: roundData.isTrainingMode ?? "",
                  pressDocId: d.id,
                  ...d.data(),
                }),
              );
            }
          } catch (e) {
            console.error(
              `    Error fetching button_presses for round ${roundDocId}:`,
              e.message,
            );
          }
        }
      } catch (e) {
        console.error(`    Error fetching rounds for ${sessionId}:`, e.message);
      }
    }
  }

  // ── Write CSVs ────────────────────────────────────────────────────────────
  console.log("\nWriting CSV files…");
  write("sessions.csv", sessionRows);
  write("tutorial_slides.csv", tutorialSlideRows);
  write("tutorial_quizzes.csv", tutorialQuizRows);
  write("rounds.csv", roundRows);
  write("button_presses.csv", buttonPressRows);
  write("gas_station_events.csv", gasStationRows);
  write("tab_events.csv", tabEventRows);

  console.log("\nDone! Files written:");
  console.log("  sessions.csv           — one row per session");
  console.log(
    "                           fields: prelim answer, instructionsResult_*, trainingResult_*,",
  );
  console.log(
    "                                   termination_reason/stage, completion_*",
  );
  console.log("  tutorial_slides.csv    — one row per slide navigation event");
  console.log("  tutorial_quizzes.csv   — one row per quiz answer submission");
  console.log(
    "  rounds.csv             — one row per round (config + outcome)",
  );
  console.log(
    "  button_presses.csv     — one row per key press; gasStationActive=1 means pump was green",
  );
  console.log(
    "  gas_station_events.csv — one row each time the pump turns on (1) or off (0)",
  );
  console.log(
    "  tab_events.csv         — one row each time participant hides or shows the tab",
  );
}

exportData().catch((e) => {
  console.error("Export failed:", e);
  process.exit(1);
});
