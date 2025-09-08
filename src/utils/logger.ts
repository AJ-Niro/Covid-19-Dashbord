import fs from "fs";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "server", "logs");
const LOG_FILE = path.join(LOGS_DIR, "http_trace.jsonl");

export function logTrace(entry: Record<string, unknown>) {
  try {
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    }

    const line = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry,
    });

    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch (err) {
    console.error("Failed to write log trace:", err);
  }
}
