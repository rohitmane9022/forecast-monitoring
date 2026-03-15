import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "2024-01-01";
  const to = searchParams.get("to") || "2024-01-31";

  try {
    const res = await fetch(
      `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream?settlementDateFrom=${from}&settlementDateTo=${to}&fuelType=WIND`,
      { cache: "no-store" }
    );

    const data = await res.json();
    console.log("ACTUALS RAW SAMPLE:", JSON.stringify(data.slice(0, 2)));

    const filtered = data
      .filter((item: any) => item.fuelType === "WIND")
      .map((item: any) => ({
        startTime: item.startTime,
        generation: item.generation,
      }));

    return NextResponse.json(filtered);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch actuals" }, { status: 500 });
  }
}