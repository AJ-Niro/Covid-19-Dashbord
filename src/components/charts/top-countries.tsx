"use client";

import { BarList, type BarListData, useChart } from "@chakra-ui/charts";
import { useColorModeValue } from "../ui/color-mode";
import { Box, Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const fetchTopCountries = async (): Promise<BarListData[]> => {
  const res = await fetch("/api/covid/topCountries");
  if (!res.ok) throw new Error("Failed to fetch top countries");

  const json = await res.json();

  return json.map((item: { country: string; cases: number }) => ({
    name: item.country,
    value: item.cases,
  }));
};

export const TopCountries = () => {
  const barBg = useColorModeValue("blue.300", "blue.800");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["topCountries"],
    queryFn: fetchTopCountries,
  });

  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data: data ?? [],
    series: [{ name: "name", color: barBg }],
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading) return <div style={{ height: 300 }}>Loading chart...</div>;
  if (isError) return <div>Error loading data</div>;

  return (
    <Box>
      <Heading size="2xl" marginBottom="1rem">
        Top countries with more cases
      </Heading>
      <BarList.Root chart={chart}>
        <BarList.Content>
          <BarList.Bar />
          <BarList.Value />
        </BarList.Content>
      </BarList.Root>
    </Box>
  );
};
