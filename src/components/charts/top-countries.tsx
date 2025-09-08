"use client";

import { BarList, type BarListData, useChart } from "@chakra-ui/charts";
import { useColorModeValue } from "../ui/color-mode";
import {
  Box,
  Heading,
  Skeleton,
  Text,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getTopCountries } from "@src/services/country.service";
import { useState } from "react";

const limits = createListCollection({
  items: [
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "30", value: "30" },
    { label: "40", value: "40" },
  ],
});

export const TopCountries = () => {
  const barBg = useColorModeValue("blue.300", "blue.800");
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["topCountries"],
    queryFn: getTopCountries,
  });

  const chartData = data
    ?.map((item) => ({
      name: item.country,
      value: item.cases,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  const chart = useChart<BarListData>({
    sort: { by: "value", direction: "desc" },
    data: chartData ?? [],
    series: [{ name: "name", color: barBg }],
  });

  if (isLoading) {
    return (
      <Box>
        <Heading size="2xl" marginBottom="1rem">
          Top {limit} countries with more cases
        </Heading>
        <Skeleton height="480px" borderRadius="md" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={4} bg="red.100" borderRadius="md">
        <Text color="red.800" fontWeight="bold">
          Error loading data
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="2xl" marginBottom="1rem">
        Top {limit} countries with more cases
      </Heading>

      <Select.Root
        collection={limits}
        value={[limit.toString()]}
        onValueChange={(details) => {
          const selected = details.value[0];
          if (selected) setLimit(Number(selected));
        }}
        marginBottom="1rem"
      >
        <Select.HiddenSelect />
        <Select.Label>Number of countries</Select.Label>

        <Select.Control>
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
            <Select.ClearTrigger />
          </Select.IndicatorGroup>
        </Select.Control>

        <Select.Positioner>
          <Select.Content>
            {limits.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>

      <BarList.Root chart={chart}>
        <BarList.Content>
          <BarList.Bar />
          <BarList.Value />
        </BarList.Content>
      </BarList.Root>
    </Box>
  );
};
