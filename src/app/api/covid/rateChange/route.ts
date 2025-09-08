import { NextResponse } from "next/server";
import { DISEASE_API_URL } from "@src/config/environmentVariables";
import { logTrace } from "@src/utils/logger";
import { sendWebhook } from "@src/utils/webhook";
import { isValidDate, groupByPeriod } from "@src/utils/date";

function calculateRateChange(aggregated: Record<string, number>) {
  const entries = Object.entries(aggregated).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const result: Record<string, number | null> = {};

  let prevValue: number | null = null;
  for (const [date, value] of entries) {
    if (prevValue === null || prevValue === 0) {
      result[date] = null;
    } else {
      result[date] = (value - prevValue) / prevValue;
    }
    prevValue = value;
  }

  return result;
}

export async function GET(req: Request) {
  const startTime = Date.now();
  let status = 200;

  try {
    const { searchParams } = new URL(req.url);

    const period =
      (searchParams.get("period") as "day" | "week" | "month") || "day";
    const country = searchParams.get("country") || "all";
    const start = searchParams.get("start") || undefined;
    const end = searchParams.get("end") || undefined;

    if (!["day", "week", "month"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Allowed values: day, week, month" },
        { status: 400 }
      );
    }

    if (start && !isValidDate(start)) {
      return NextResponse.json(
        { error: "Invalid start date. Expected format: YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (end && !isValidDate(end)) {
      return NextResponse.json(
        { error: "Invalid end date. Expected format: YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (start && end && start > end) {
      return NextResponse.json(
        { error: "Start date cannot be after end date" },
        { status: 400 }
      );
    }

    if (country && typeof country !== "string") {
      return NextResponse.json(
        { error: "Invalid country parameter" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${DISEASE_API_URL}/historical/${country}?lastdays=all`
    );
    if (!res.ok) {
      throw new Error(`Disease API returned status ${res.status}`);
    }

    const json = await res.json();
    const cases = json.timeline ? json.timeline.cases : json.cases;

    const aggregated = groupByPeriod(cases, period, start, end);
    const rateChange = calculateRateChange(aggregated);

    const traceEntry = {
      method: "GET",
      endpoint: "/api/covid/rateChange",
      status: res.status,
      duration_ms: Date.now() - startTime,
      meta: {
        period,
        country: country || "Global",
        count: Object.keys(rateChange).length,
      },
    };

    logTrace(traceEntry);

    sendWebhook({
      event: "COVID_RATE_CHANGE",
      timestamp: new Date().toISOString(),
      status: res.status,
      duration_ms: Date.now() - startTime,
      data: rateChange,
    });

    return NextResponse.json({
      period,
      country: country || "Global",
      start: start || null,
      end: end || null,
      rateChange,
    });
  } catch (err: unknown) {
    console.error("err => ", err);
    status = 500;
    logTrace({
      method: "GET",
      endpoint: "/api/covid/rateChange",
      status,
      error: err instanceof Error ? err.message : "unknown",
    });

    return NextResponse.json({ error: "Internal Server Error" }, { status });
  }
}
