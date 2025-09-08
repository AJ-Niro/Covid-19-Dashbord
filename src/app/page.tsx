import { Heading, Container } from "@chakra-ui/react";
import { TopCountries } from "@src/components/charts/top-countries";
import { CasesByPeriodChart } from "@src/components/charts/cases-by-period";
import { RateChange } from "@src/components/charts/rate-change";

export default function Home() {
  return (
    <Container maxWidth="1200px" marginX="auto" padding="1rem">
      <Heading textAlign="center" size="3xl" marginBottom="1rem">
        Covid-19 Charts
      </Heading>
      <TopCountries />
      <RateChange />
      <CasesByPeriodChart />
    </Container>
  );
}
