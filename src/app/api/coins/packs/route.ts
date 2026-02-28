import { NextResponse } from "next/server";
import { getCoinPacks } from "@/modules/coin/coin.service";

// GET — list active coin packs
export async function GET() {
  const packs = await getCoinPacks();
  return NextResponse.json({ packs });
}
