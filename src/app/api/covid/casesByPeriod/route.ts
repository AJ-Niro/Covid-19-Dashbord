import { NextResponse } from "next/server";
import { DISEASE_API_URL } from "@src/config/environmentVariables";
import { logTrace } from "@src/utils/logger";
import { sendWebhook } from "@src/utils/webhook";
import { isValidDate, parseApiDate } from "@src/utils/date";

function groupByPeriod(
  data: Record<string, number>,
  period: "day" | "week" | "month",
  start?: string,
  end?: string
) {
  const result: Record<string, number> = {};

  for (const [dateStr, value] of Object.entries(data)) {
    const iso = parseApiDate(dateStr);

    if (start && iso < start) continue;
    if (end && iso > end) continue;

    let key = iso;
    if (period === "week") {
      const d = new Date(iso);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const week1 = new Date(d.getFullYear(), 0, 4);
      const week =
        1 +
        Math.round(
          ((d.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        );

      key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }
    if (period === "month") {
      const [year, month] = iso.split("-");
      key = `${year}-${month}`;
    }

    result[key] = (result[key] || 0) + value;
  }

  return result;
}

export async function GET(req: Request) {
  const startTime = Date.now();
  let status = 200;

  try {
    const { searchParams } = new URL(req.url);

    const period =
      (searchParams.get("period") as "day" | "week" | "month") || "month";
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

    const traceEntry = {
      method: "GET",
      endpoint: "/api/covid/casesByPeriod",
      status: res.status,
      duration_ms: Date.now() - startTime,
      meta: {
        period,
        country: country || "Global",
        count: Object.keys(aggregated).length,
      },
    };

    logTrace(traceEntry);

    sendWebhook({
      event: "COVID_CASES_BY_PERIOD",
      timestamp: new Date().toISOString(),
      status: res.status,
      duration_ms: Date.now() - startTime,
      data: aggregated,
    });

    return NextResponse.json({
      period,
      country: country || "Global",
      start: start || null,
      end: end || null,
      aggregated,
    });
  } catch (err: unknown) {
    console.error("err => ", err);
    status = 500;
    logTrace({
      method: "GET",
      endpoint: "/api/covid/casesByPeriod",
      status,
      error: err instanceof Error ? err.message : "unknown",
    });

    return NextResponse.json({ error: "Internal Server Error" }, { status });
  }
}
