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
import { getCasesByRange } from "@src/services/cases.service";
import { formatNumber } from "@src/utils/number";
import { isValidDate } from "@src/utils/date";
import { getCountries } from "@src/services/country.service";

const periods = createListCollection({
  items: [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ],
});

export const CasesByPeriodChart = () => {
  const barBg = useColorModeValue("blue.300", "blue.800");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2024-01-31");
  const [country, setCountry] = useState("all");
  const [period, setPeriod] = useState("month");

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
    queryKey: ["casesByRange", period, startDate, endDate, country],
    queryFn: () => getCasesByRange(period, startDate, endDate, country),
    enabled:
      isValidDate(startDate) &&
      isValidDate(endDate) &&
      new Date(startDate) <= new Date(endDate),
  });

  const chartData =
    data && data.aggregated
      ? Object.entries(data.aggregated).map(([key, value]) => ({
          date: key,
          cases: Number(value),
        }))
      : [];

  const chart = useChart({
    data: chartData,
    series: [{ name: "cases", color: barBg }],
  });

  if (isLoading) {
    return (
      <Box>
        <Heading size="2xl" mb="1rem">
          COVID Cases for {country === "all" ? "all countries" : country}
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
      <Heading size="2xl" mb="1rem">
        COVID Cases for {country === "all" ? "all countries" : country}
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
          collection={periods}
          value={[period]}
          onValueChange={(details) => {
            const selected = details.value[0];
            if (selected) setPeriod(selected);
          }}
        >
          <Select.HiddenSelect />
          <Select.Label>Period</Select.Label>

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
              {periods.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
        <Select.Root
          collection={countries}
          value={[country]}
          onValueChange={(details) => {
            const selected = details.value[0];
            if (selected) setCountry(selected);
          }}
          flex="1"
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
            tickFormatter={formatNumber}
          />
          <Tooltip
            animationDuration={100}
            cursor={false}
            content={<Chart.Tooltip formatter={formatNumber} />}
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
