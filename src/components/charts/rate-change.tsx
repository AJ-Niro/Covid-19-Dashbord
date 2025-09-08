"use client";

import { Chart, useChart } from "@chakra-ui/charts";
import {
  Box,
  Heading,
  Skeleton,
  Text,
  Field,
  Input,
  Select,
  HStack,
  createListCollection,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getRateChange } from "@src/services/cases.service";
import { formatPercent } from "@src/utils/number";
import { isValidDate } from "@src/utils/date";
import { getCountries } from "@src/services/country.service";

export const RateChange = () => {
  const lineColor = useColorModeValue("green.400", "green.600");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2024-01-31");
  const [country, setCountry] = useState("all");

  const {
    data: countriesData,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const countries = createListCollection({
    items: [
      ...(countriesData?.countries.map((c) => ({
        label: c,
        value: c,
      })) ?? []),
    ],
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["rateChange", startDate, endDate, country],
    queryFn: () => getRateChange(startDate, endDate, country),
    enabled:
      isValidDate(startDate) &&
      isValidDate(endDate) &&
      new Date(startDate) <= new Date(endDate),
  });

  const chartData =
    data && data.rateChange
      ? Object.entries(data.rateChange).map(([date, value]) => ({
          date,
          rate: Number(value),
        }))
      : [];

  const chart = useChart({
    data: chartData,
    series: [{ name: "rate", color: lineColor }],
  });

  if (isLoading) {
    return (
      <Box mb="1rem">
        <Heading size="2xl" mb="1rem">
          COVID Rate Change for {country === "all" ? "all countries" : country}
        </Heading>
        <Skeleton height="480px" borderRadius="md" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box p={4} bg="red.100" borderRadius="md" mb="1rem">
        <Text color="red.800" fontWeight="bold">
          Error loading data
        </Text>
      </Box>
    );
  }

  return (
    <Box mb="1rem">
      <Heading size="2xl" mb="1rem">
        COVID Cases Rate change for{" "}
        {country === "all" ? "all countries" : country}
      </Heading>

      <HStack flexDirection={{ base: "column", md: "row" }} gap={4} mb="1rem">
        <Field.Root required>
          <Field.Label>Start date</Field.Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field.Root>
        <Field.Root required>
          <Field.Label>End date</Field.Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field.Root>
        <Select.Root
          collection={countries}
          value={[country]}
          onValueChange={(details) => {
            const selected = details.value[0];
            if (selected) setCountry(selected);
          }}
        >
          <Select.HiddenSelect />
          <Select.Label>Country</Select.Label>

          <Select.Control>
            <Select.Trigger>
              {isCountriesLoading ? "Loading..." : <Select.ValueText />}
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
              <Select.ClearTrigger />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content>
              {isCountriesError ? (
                <Select.Item item={{ label: "Error loading", value: "error" }}>
                  Error
                </Select.Item>
              ) : (
                countries.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))
              )}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </HStack>

      <Chart.Root maxH="sm" chart={chart}>
        <LineChart data={chart.data}>
          <CartesianGrid stroke={chart.color("border")} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey={chart.key("date")}
            tickFormatter={(value) => value}
            stroke={chart.color("border")}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            stroke={chart.color("border")}
            tickFormatter={formatPercent}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip formatter={formatPercent} />}
          />
          {chart.series.map((item) => (
            <Line
              key={item.name}
              isAnimationActive={false}
              dataKey={chart.key(item.name)}
              stroke={chart.color(item.color)}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </Chart.Root>
    </Box>
  );
};
