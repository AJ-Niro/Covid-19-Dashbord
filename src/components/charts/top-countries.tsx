"use client";

import { BarList, type BarListData, useChart } from "@chakra-ui/charts";
import { useColorModeValue } from "../ui/color-mode";
import { Box, Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopCountries } from "@src/services/country.service";

export const TopCountries = () => {
  const barBg = useColorModeValue("blue.300", "blue.800");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["topCountries"],
    queryFn: getTopCountries,
  });

  const chartData = data?.map((item) => ({
    name: item.country,
    value: item.cases,
  }));

  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data: chartData ?? [],
    series: [{ name: "name", color: barBg }],
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || isLoading)
    return <div style={{ height: 300 }}>Loading chart...</div>;
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
