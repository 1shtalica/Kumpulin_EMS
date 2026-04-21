import { NextResponse } from "next/server";
import { MOCK_ORGANIZER_PROFILE } from "@/lib/data/mock-organizer-profile";

/**
 * GET /api/organizer/profile
 *
 * Mock endpoint — mirrors the real backend contract:
 * GET /organizer/profile
 *
 * Swap this out with a real proxy/fetch call once the BE is ready.
 */
export async function GET() {
  // Simulate a slight network delay so loading states are visible
  await new Promise((resolve) => setTimeout(resolve, 400));

  return NextResponse.json({
    success: true,
    message: "success",
    data: MOCK_ORGANIZER_PROFILE,
  });
}
