import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import { readProfiles, writeProfiles } from "../../../lib/profiles";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: "Missing id" });

  const profiles = await readProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const [removed] = profiles.splice(idx, 1);
  if (removed.profileImage) {
    const imgPath = path.join(process.cwd(), "public", removed.profileImage.replace(/^\//, ""));
    try {
      await fs.unlink(imgPath);
    } catch (e) {
      // ignore missing file
    }
  }
  await writeProfiles(profiles);
  res.json({ ok: true });
}
