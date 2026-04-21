import { NextResponse } from "next/server";
import { MOCK_ORGANIZER_PROFILE } from "@/lib/data/mock-organizer-profile";

/**
 * GET /api/organizer/[id]/profile
 *
 * Public mock endpoint — returns organizer profile by ID.
 * Mirrors the real backend contract: GET /organizer/:id/profile
 *
 * For now always returns the mock dataset regardless of `id`.
 * Swap to a real DB/proxy call once the BE is ready.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400));

  // TODO: look up real organizer by `id` when BE is ready
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Organizer ID is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "success",
    data: {
      ...MOCK_ORGANIZER_PROFILE,
      // Reflect the requested id back so the FE can cross-check
      organizer: {
        ...MOCK_ORGANIZER_PROFILE.organizer,
        id,
      },
    },
  });
}
