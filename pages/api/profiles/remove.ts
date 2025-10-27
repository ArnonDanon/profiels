import type { NextApiRequest, NextApiResponse } from "next";

// These Next.js API routes have been migrated to the external .NET API.
// Keep the route in place but return 410 to make the migration explicit.

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(410).json({ error: "migrated", message: "This endpoint was migrated to the external .NET API. Use NEXT_PUBLIC_API_BASE + /api/profiles/remove" });
}
