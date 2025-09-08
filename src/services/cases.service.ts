export const getCasesByRange = async (
  period: string,
  start: string,
  end: string,
  country: string
) => {
  const res = await fetch(
    `/api/covid/casesByPeriod?period=${period}&start=${start}&end=${end}&country=${country}`
  );
  if (!res.ok) throw new Error("Error fetching cases");
  return res.json();
};

export const getRateChange = async (
  start: string,
  end: string,
  country: string
) => {
  const res = await fetch(
    `/api/covid/rateChange?start=${start}&end=${end}&country=${country}`
  );
  if (!res.ok) throw new Error("Error fetching rate change");
  return res.json();
};
