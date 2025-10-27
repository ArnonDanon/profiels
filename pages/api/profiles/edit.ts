import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { ensureUploadsDir, readProfiles, writeProfiles } from "../../../lib/profiles";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  await ensureUploadsDir();

  const form = formidable({ multiples: false });
  form.parse(req as any, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });
    const id = Array.isArray(fields.id) ? fields.id[0] : (fields.id ?? "");
    const profileName = Array.isArray(fields.profileName)
      ? fields.profileName[0]
      : (fields.profileName ?? undefined);

    const profiles = await readProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });

    const profile = profiles[idx];

    if (profileName) profile.profileName = profileName;

    if (files?.profileImage) {
      // delete old if exists
      if (profile.profileImage) {
        const oldPath = path.join(process.cwd(), "public", profile.profileImage.replace(/^\//, ""));
        try {
          await fs.unlink(oldPath);
        } catch (e) { /* ignore */ }
      }
      const file = Array.isArray(files.profileImage) ? files.profileImage[0] : files.profileImage;
      const tmpPath = (file as any).filepath || (file as any).path;
      const fileName = `${Date.now()}_${(file as any).originalFilename || (file as any).name}`;
      const dest = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.rename(tmpPath, dest);
      profile.profileImage = `/uploads/${fileName}`;
    }

    profiles[idx] = profile;
    await writeProfiles(profiles);
    res.json(profile);
  });
}
