import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
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
    const profileName = Array.isArray(fields.profileName)
      ? fields.profileName[0]
      : (fields.profileName ?? "Unnamed");
    let imageUrl: string | undefined = undefined;

    if (files?.profileImage) {
      const file = Array.isArray(files.profileImage) ? files.profileImage[0] : files.profileImage;
      const tmpPath = (file as any).filepath || (file as any).path;
      const fileName = `${Date.now()}_${(file as any).originalFilename || (file as any).name}`;
      const dest = path.join(process.cwd(), "public", "uploads", fileName);
      await fs.rename(tmpPath, dest);
      imageUrl = `/uploads/${fileName}`;
    }

    const profiles = await readProfiles();
    const newProfile = { id: uuidv4(), profileName, profileImage: imageUrl };
    profiles.unshift(newProfile);
    await writeProfiles(profiles);
    res.json(newProfile);
  });
}
