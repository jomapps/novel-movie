# Character Image Generation System (Enhanced)

## Purpose and Goals
Build a dedicated, scalable image management workspace for Characters that:
- Centralizes reference and 360° portfolio generation per character
- Presents a BAML-suggested prompt for editing and also supports free-form prompts
- Persists prompts, images, and metadata (no richText) in PayloadCMS
- Stores images in the existing Media collection by downloading remote URLs; Media will expose Cloudflare public URLs
- Provides a grid UI with delete operations (local + remote when supported)

## Where / Route and Navigation
- Character Detail toolbar: remove inline image generation buttons; add an "Images" link that opens Image Management
- Route: `/screenplay/characters/[characterId]/images`
- Navigation: Top-left Back button returns to the Character Detail page

Rationale: We need a full workspace because we will generate and manage many images (reference and portfolio) and require a wide grid layout.

## Features
- [ ] Generate first reference image for a character
- [ ] Generate full 360° portfolio (Character Library returns all at once)
- [ ] Show BAML-suggested prompt for editing; also allow fully manual prompts
- [ ] Support multiple reference generations (history)
- [ ] Grid: thumbnails, prompt, kind (reference/portfolio), createdAt, status, actions
- [ ] Delete image: removes local record/media and also remote asset (when supported)
- [ ] Persist the exact prompt used for each image

## Data Model
We follow the "media for files + metadata for semantics" pattern.

1) Reuse the existing Media collection (binary storage)
- Download the remote image URL returned by Character Library
- Upload to Media so it gets a Cloudflare public URL exposed by our system
- Do not store images as external-only; always ingest

2) New collection: `character-image-metadata` (no richText fields)
- characterReference: relationship to Character References (required)
- media: relationship to Media (required; the ingested image)
- kind: select ["reference", "portfolioItem", "scene"]
- provider: text (default: "character-library")
- prompt: text (exact prompt used)
- sourceUrl: text (original Character Library URL)
- externalId: text (remote ID if provided)
- status: select ["succeeded", "failed"]
- error: textarea (plain text)
- metrics: JSON (e.g., durationMs)
- createdBy: relationship to users (optional)
- timestamps: createdAt, updatedAt

## API Design (custom APIs must live under /v1)
All server calls must run on the server (no secrets in client). No webhooks. Portfolio is synchronous.

- POST `/v1/characters/:id/generate-initial-image`
  - Body: `{ prompt?: string }`
  - Calls Character Library to generate a master reference; on success downloads `publicUrl`, uploads to Media, creates `character-image-metadata` with kind=`reference`
  - On HTTP 500 from Character Library: surface error; do not create records; do not retry

- POST `/v1/characters/:id/generate-360-set`
  - Calls Character Library to generate a full 360° set; returns all at once
  - For each item: download, save to Media, create `character-image-metadata` with kind=`portfolioItem`

- POST `/v1/characters/:id/generate-scene-image`
  - Body: `{ sceneContext: string }`
  - Generates a scene-specific image; download → Media → `character-image-metadata` with kind=`scene`

- GET `/v1/characters/:id/images`
  - Lists image metadata joined with Media (newest first)

- DELETE `/v1/characters/:id/images/:imageId`
  - Deletes local Media and metadata
  - If provider=`character-library` and kind=`reference`, also sends DELETE to Character Library `/api/v1/characters/{libraryDbId}/reference-image` once (no retries)

- GET `/v1/characters/:id/initial-image-prompt`
  - Returns `{ success: boolean, prompt: string }` built solely from existing character data (no new values)
  - Used to pre-fill the editable prompt in the Reference panel


Security: enforce standard session/auth checks; no special access restriction beyond normal project access.

## Prompt UX
- On page load: auto-filled AI prompt assembled from existing character data (no new values), editable
- Button: "AI Suggest Prompt" regenerates the suggestion; never overwrites while user is typing
- Also supports fully manual prompts
- Store the exact prompt used in metadata; avoid quotes in generated content

## Image Ingestion Flow
1) Call Character Library (server-side) → receive remote `publicUrl`
2) Server downloads the file → streams/uploads into Media
3) Media produces our Cloudflare public URL (as per existing config)
4) Create characterImageMetadata with links and prompt

## UI Structure (App Router)
- Page: `app/screenplay/characters/[characterId]/images/page.tsx`
  - Header: Back button, character name/ID
  - Section: Reference Generation Panel
    - Auto-filled AI Prompt (editable)
    - Actions: Generate Reference, AI Suggest Prompt (regenerate)
  - Section: Portfolio Generation Panel
    - Select a reference image (radio/card) + Start Portfolio
  - Section: Image Grid
    - Cards show thumbnail (from Media), kind, prompt, createdAt, actions (Delete)

Use existing component patterns, /lib utilities, and registry.json conventions.

## Concrete Implementation Steps (Trackable)
Backend
- [x] Add `character-image-metadata` collection to Payload (fields above; no richText)
- [x] Implement POST /v1/characters/:id/generate-initial-image (generate + download + Media + metadata)
- [x] Implement POST /v1/characters/:id/generate-360-set (bulk download + Media + metadata)
- [x] Implement POST /v1/characters/:id/generate-scene-image (download + Media + metadata)
- [x] Implement GET /v1/characters/:id/images (list with join)
- [x] Implement DELETE /v1/characters/:id/images/:imageId (local + remote delete for reference images)

Frontend
- [x] Create route/page `/screenplay/characters/[characterId]/images`
- [x] Reference generation textarea + button (editable prompt)
- [x] 360° set generation button
- [x] ImageGrid (thumbnails + delete)
- [x] Character Detail toolbar: remove inline image generation buttons; add "Images" link
- [x] Auto-fill editable AI prompt via GET /v1/characters/:id/initial-image-prompt; "AI Suggest Prompt" button


Docs/Ops/Telemetry
- [ ] Update docs/externalServices/character-library usage and expectations
- [ ] Ensure env: `SITE_URL`, `CHARACTER_LIBRARY_API_URL` (no API key per current answer)
- [ ] Add basic duration metrics capture
- [ ] Remove any deprecated direct-generate code

## Testing Plan
Unit (server)
- Reference generation: success creates Media + metadata; 500 returns error and no records
- Portfolio generation: creates N Media + metadata records
- Delete: removes metadata + Media; attempts remote delete

Integration (mocked)
- Mock Character Library responses for reference/portfolio
- Mock download step (fetch/stream) and verify Media creation invocations

E2E (manual runbook)
- Generate reference → see it in grid with prompt and Cloudflare URL
- Generate portfolio → all images appear in grid
- Delete image → removed from grid; verify remote delete request sent

## Acceptance Criteria
- New route exists and accessible via "Image Management" button
- BAML prompt appears and is editable; manual prompt supported
- Reference and portfolio images ingested to Media (Cloudflare URLs) and tracked via metadata
- Grid lists images with prompt/kind and supports delete
- APIs live under /v1; errors from Character Library (500) are surfaced without retries

## Notes and Constraints
- No webhooks; portfolio returns all at once (no polling/queue)
- Do not hardcode localhost; use SITE_URL
- PayloadCMS is the only data layer

## Resolved Questions (Summary)
1) Media reused; add a new images metadata collection (no richText)
2) On delete: also delete remote asset (when supported)
3) Portfolio returns all at once; handle as bulk ingest
4) No API key currently required
5) Use BAML to propose a prompt; user edits; also support free-form
6) Always download remote URLs and ingest into Media; use Cloudflare public URL
7) No specific UI component preference
8) No special access control beyond normal project access
9) No webhooks
10) Path `/screenplay/characters/[characterId]/images` is accepted


## Reference Prompt Requirements (Implemented)
- The Reference panel now auto-fills a high-quality prompt built from existing character data (BAML-generated fields where available)
- Endpoint: GET `/v1/characters/:id/initial-image-prompt`
- The prompt is solely for the master reference image and includes the required framing details:
  "chest-to-mid-thigh crop, equal headroom, characters pinned to left/right thirds, inter-subject gap ≈ 7% of frame width, matched eye level, 35mm lens."
- Users can edit before generating and can click "AI Suggest Prompt" to regenerate


