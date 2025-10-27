# dotnet-api (for Next.js profiles app)

This is a minimal .NET 8.0 Web API that provides identical endpoints to the Next.js `pages/api/profiles/*` handlers. It reads/writes the same `data/profiles.json` and stores uploads in `public/uploads` so the Next.js UI can continue to serve images.

Endpoints:
- GET  /api/profiles/list
- POST /api/profiles/add      (multipart/form-data: profileName, profileImage)
- POST /api/profiles/edit     (multipart/form-data: id, profileName (optional), profileImage (optional))
- POST /api/profiles/remove   (JSON body: { "id": "..." })

Run (from `c:\temp\AI\test\dotnet-api`):

```powershell
# restore/build
dotnet build
# run (binds to http://localhost:5001)
dotnet run
```

Notes:
- The API allows CORS from `http://localhost:3000` so the Next.js dev server can call it directly.
- The project expects to be placed as a sibling to the Next.js project (it uses `..\data` and `..\public\uploads`). If you move it, update the paths in `ProfilesStore`.
