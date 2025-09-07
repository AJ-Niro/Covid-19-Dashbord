"use client";

import { BarList, type BarListData, useChart } from "@chakra-ui/charts";
import { useColorModeValue } from "../ui/color-mode";
import { Box, Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export const TopCountries = () => {
  const barBg = useColorModeValue("blue.300", "blue.800");
  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data: [
      { name: "Argentina", value: 1200000 },
      { name: "USA", value: 100000 },
      { name: "Africa", value: 200000 },
      { name: "Taiwan", value: 20000 },
      { name: "Costa Rica", value: 1345000 },
      { name: "Canada", value: 100000 },
      { name: "Italia", value: 100000 },
    ],
    series: [{ name: "name", color: barBg }],
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ height: 300 }}>Loading chart...</div>;

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
