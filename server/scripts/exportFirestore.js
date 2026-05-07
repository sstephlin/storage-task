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
  // console.log("\nWriting CSV files…");
  // write("sessions.csv", sessionRows);
  // write("tutorial_slides.csv", tutorialSlideRows);
  // write("tutorial_quizzes.csv", tutorialQuizRows);
  // write("rounds.csv", roundRows);
  // write("button_presses.csv", buttonPressRows);
  // write("gas_station_events.csv", gasStationRows);
  // write("tab_events.csv", tabEventRows);
  // ── Write CSVs ────────────────────────────────────────────────────────────
  console.log("\nWriting CSV files…");

  const sortByUserThenTime = (rows, timeField = "timestamp") =>
    rows.sort((a, b) => {
      if (a.userId < b.userId) return -1;
      if (a.userId > b.userId) return 1;
      const ta = a[timeField] ?? "";
      const tb = b[timeField] ?? "";
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });

  write("sessions.csv", sortByUserThenTime(sessionRows, "startTime"));
  write("tutorial_slides.csv", sortByUserThenTime(tutorialSlideRows));
  write("tutorial_quizzes.csv", sortByUserThenTime(tutorialQuizRows));
  write("rounds.csv", sortByUserThenTime(roundRows, "startTime"));
  write("button_presses.csv", sortByUserThenTime(buttonPressRows));
  write("gas_station_events.csv", sortByUserThenTime(gasStationRows));
  write("tab_events.csv", sortByUserThenTime(tabEventRows));

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
