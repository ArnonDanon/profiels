# Profiles Manager

A Next.js application for managing profiles with image uploads.

## Features

- Create profiles with names and images
- Edit existing profiles
- Delete profiles
- Image upload support
- Simple JSON-based storage

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/profiles/add` - Create new profile
- `POST /api/profiles/edit` - Update existing profile
- `POST /api/profiles/remove` - Delete profile
- `GET /api/profiles/list` - List all profiles

## Running the app with the external .NET API

This repository ships both the Next.js frontend and a small .NET minimal API (in `./dotnet-api`). The .NET API provides the same endpoints under `/api/profiles/*` and reads/writes the same `data/profiles.json` and `public/uploads` so the two can be run together locally.

Two common ways to run locally:

- Option A — Run servers separately (recommended for development)

  1. Start the .NET API (from a PowerShell terminal):

	  ```powershell
	  cd C:\temp\AI\test\dotnet-api
	  dotnet build
	  dotnet run --urls "http://localhost:5001"
	  ```

  2. Start the Next.js dev server (in a separate terminal):

	  ```powershell
	  cd C:\temp\AI\test
	  npm install
	  npm run dev
	  ```

  3. Tell the Next.js app to use the .NET API by creating `.env.local` (or copying the example):

	  ```powershell
	  copy .env.local.example .env.local
	  # or edit .env.local and set NEXT_PUBLIC_API_BASE=http://localhost:5001
	  ```

  When `NEXT_PUBLIC_API_BASE` is set, the UI will call `${NEXT_PUBLIC_API_BASE}/api/profiles/*` (so it will hit the .NET API). CORS is already enabled on the .NET API for http://localhost:3000.

- Option B — Run both from one terminal (simple PowerShell helper)

  You can start both processes in separate PowerShell tabs or use a helper script. An example one-liner that starts both in parallel (keeps both logs visible in the same terminal) is:

  ```powershell
  Start-Process -NoNewWindow -FilePath pwsh -ArgumentList '-NoExit','-Command','cd "C:\temp\AI\test\dotnet-api"; dotnet run --urls "http://localhost:5001"' ; Start-Process -NoNewWindow -FilePath pwsh -ArgumentList '-NoExit','-Command','cd "C:\temp\AI\test"; npm run dev'
  ```

  (On Windows with plain PowerShell 5.1 you can open two terminals or create a small .ps1 script that launches each server in its own window.)

Notes and tips

- The .NET API reads/writes `..\data\profiles.json` and `..\public\uploads` relative to the `dotnet-api` folder. If you move the `dotnet-api` folder, update `ProfilesStore` paths.
- During migration I left the Next.js `pages/api/profiles/*` routes in place but changed them to respond with `410 Gone` and a message pointing to the external API. This makes the migration explicit. If you prefer to remove them entirely, delete the files under `pages/api/profiles`.
- To run the Next.js app against the legacy in-process API, remove `NEXT_PUBLIC_API_BASE` so the client will call the same-origin `/api/profiles/*` routes.

If you want, I can add a small `dev.ps1` script to the repo that runs both servers in separate windows and copies `.env.local.example` to `.env.local` automatically. Would you like that? 
