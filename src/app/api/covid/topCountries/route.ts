import { NextResponse } from "next/server";
import { DISEASE_API_URL } from "@src/config/environmentVariables";
import { CountryData } from "@src/types/country.type";

export async function GET() {
  const res = await fetch(`${DISEASE_API_URL}/countries`);
  const json: CountryData[] = await res.json();

  const top10 = json
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10)
    .map((c) => ({
      country: c.country,
      cases: c.cases,
    }));

  return NextResponse.json(top10);
}
