import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "profiles.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export type Profile = {
  id: string;
  profileName: string;
  profileImage?: string; // relative URL path like /uploads/...
};

export async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

export async function readProfiles(): Promise<Profile[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Profile[];
  } catch (e) {
    return [];
  }
}

export async function writeProfiles(profiles: Profile[]) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(profiles, null, 2), "utf-8");
}
