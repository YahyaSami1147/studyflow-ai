export type HealthData = {
  status: string;
  environment: string;
  checkedAt: string;
  source: string;
};

export async function fetchHealthData(): Promise<HealthData> {
  const response = await fetch(
    "data:application/json,%7B%22status%22%3A%22Operational%22%2C%22source%22%3A%22server-fetch%22%7D",
    { cache: "no-store" },
  );
  const data = (await response.json()) as Pick<HealthData, "status" | "source">;

  return {
    ...data,
    environment: process.env.NODE_ENV ?? "development",
    checkedAt: new Date().toISOString(),
  };
}
