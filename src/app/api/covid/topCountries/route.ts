import { NextResponse } from "next/server";
import { DISEASE_API_URL } from "@src/config/environmentVariables";
import { CountryData } from "@src/types/country.type";
import { logTrace } from "@src/utils/logger";

export async function GET() {
  const start = Date.now();
  let status = 200;

  try {
    const res = await fetch(`${DISEASE_API_URL}/countries`);
    const json: CountryData[] = await res.json();

    const top10 = json
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 10)
      .map((c) => ({
        country: c.country,
        cases: c.cases,
      }));

    const traceEntry = {
      method: "GET",
      endpoint: "/api/top10",
      status: res.status,
      duration_ms: Date.now() - start,
      meta: { count: top10.length },
    };

    logTrace(traceEntry);

    return NextResponse.json(top10);
  } catch (err: unknown) {
    status = 500;
    logTrace({
      method: "GET",
      endpoint: "/api/top10",
      status,
      error: err instanceof Error ? err.message : "unknown",
    });

    return NextResponse.json({ error: "Internal Server Error" }, { status });
  }
}
