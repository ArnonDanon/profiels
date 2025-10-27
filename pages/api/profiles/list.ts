import type { NextApiRequest, NextApiResponse } from "next";
import { readProfiles } from "../../../lib/profiles";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const profiles = await readProfiles();
  res.json(profiles);
}
