import { NextResponse } from "next/server";
import { DISEASE_API_URL } from "@src/config/environmentVariables";
import { CountryData } from "@src/types/country.type";

export async function GET() {
  try {
    const res = await fetch(`${DISEASE_API_URL}/countries`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data: CountryData[] = await res.json();

    const countries = data.map((c) => c.country);
    const countriesPlusAll = ["all", ...countries];

    return NextResponse.json({ countries: countriesPlusAll });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to fetch countries",
      },
      { status: 500 }
    );
  }
}
