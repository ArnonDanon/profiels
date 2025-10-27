import React, { useEffect, useState } from "react";

type Profile = {
  id: string;
  profileName: string;
  profileImage?: string;
};

export default function Home() {
  // Use NEXT_PUBLIC_API_BASE to call the external API (e.g. http://localhost:5001).
  // Leave empty to keep same-origin behavior.
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);

  async function load() {
    const res = await fetch(`${API_BASE}/api/profiles/list`);
    const data = await res.json();
    setProfiles(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("profileName", name);
    if (file) fd.append("profileImage", file);
  const res = await fetch(`${API_BASE}/api/profiles/add`, { method: "POST", body: fd });
    const newProfile = await res.json();
    setProfiles((p) => [newProfile, ...p]);
    setName("");
    setFile(null);
    (document.getElementById("add-file") as HTMLInputElement).value = "";
  }

  async function handleDelete(id: string) {
    await fetch(`${API_BASE}/api/profiles/remove`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setProfiles((p) => p.filter((x) => x.id !== id));
  }

  function startEdit(p: Profile) {
    setEditingId(p.id);
    setEditName(p.profileName);
    setEditFile(null);
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const fd = new FormData();
    fd.append("id", editingId);
    fd.append("profileName", editName);
    if (editFile) fd.append("profileImage", editFile);
  const res = await fetch(`${API_BASE}/api/profiles/edit`, { method: "POST", body: fd });
    const updated = await res.json();
    setProfiles((p) => p.map((it) => (it.id === updated.id ? updated : it)));
    setEditingId(null);
    setEditFile(null);
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Profiles</h1>

      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input id="add-file" style={{ marginLeft: 8 }} type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button style={{ marginLeft: 8 }} type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {profiles.map((p) => (
          <li key={p.id} style={{ marginBottom: 12, border: "1px solid #ddd", padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {p.profileImage ? <img src={p.profileImage} alt="" style={{ width: 64, height: 64, objectFit: "cover", marginRight: 12 }} /> : <div style={{ width: 64, height: 64, background: "#eee", marginRight: 12 }} />}
              <div style={{ flex: 1 }}>
                {editingId === p.id ? (
                  <form onSubmit={submitEdit}>
                    <input required value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <input style={{ marginLeft: 8 }} type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] ?? null)} />
                    <button style={{ marginLeft: 8 }} type="submit">Save</button>
                    <button style={{ marginLeft: 8 }} type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <div style={{ fontWeight: 600 }}>{p.profileName}</div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => startEdit(p)}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 8 }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
