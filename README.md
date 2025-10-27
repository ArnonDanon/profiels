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
