import { CountryData } from "@src/types/country.type";

export const getTopCountries: () => Promise<CountryData[]> = async () => {
  const res = await fetch("/api/covid/topCountries");
  if (!res.ok) throw new Error("Failed to fetch top countries");

  return await res.json();
};
