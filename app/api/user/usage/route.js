import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRecord = await db.user.findUnique({
      where: { id: userId },
    });

    // If no record exists, they haven't used any generations yet
    const freeGenerationsUsed = userRecord?.freeGenerationsUsed || 0;
    const subscriptionTier = userRecord?.subscriptionTier || "free";
    const remaining = subscriptionTier === "pro" ? Infinity : Math.max(0, 2 - freeGenerationsUsed);
    const blocked = subscriptionTier === "free" && freeGenerationsUsed >= 2;

    return NextResponse.json({
      freeGenerationsUsed,
      subscriptionTier,
      remaining,
      blocked,
    });
  } catch (err) {
    console.error("usage fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
