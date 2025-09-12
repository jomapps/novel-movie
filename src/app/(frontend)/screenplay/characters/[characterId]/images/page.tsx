'use client'

import React from 'react'
import { useParams } from 'next/navigation'

function ImagesClient({ characterRefId }: { characterRefId: string }) {
  'use client'
  const [images, setImages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState('')
  const [generating, setGenerating] = React.useState<'ref' | 'set' | null>(null)
  const [character, setCharacter] = React.useState<{
    id?: string
    name?: string
    libraryDbId?: string | null
    libraryCharacterId?: string | null
    libraryAssets?: {
      masterReferencePublicUrl?: string | null
      coreSetGenerated?: boolean
      coreSetCount?: number
    }
  } | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/v1/characters/${characterRefId}/images`, { cache: 'no-store' })
      const data = await res.json()
      if (data?.success) {
        setImages(data.images || [])
        if (data.character) setCharacter(data.character)
      }
    } catch (e) {
      console.error('Failed to load images', e)
    } finally {
      setLoading(false)
    }
  }, [characterRefId])

  React.useEffect(() => {
    load()
    // Pre-fill editable prompt from AI using existing character data
    const fetchPrompt = async () => {
      try {
        const res = await fetch(`/v1/characters/${characterRefId}/initial-image-prompt`, {
          cache: 'no-store',
        })
        const data = await res.json()
        if (data?.success && typeof data.prompt === 'string' && !prompt.trim()) {
          setPrompt(data.prompt)
        }
      } catch (e) {
        console.warn('Failed to fetch AI prompt', e)
      }
    }
    fetchPrompt()
  }, [load, characterRefId])

  const generateReference = async () => {
    setGenerating('ref')
    try {
      const res = await fetch(`/v1/characters/${characterRefId}/generate-initial-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!data?.success) alert(data?.error || 'Generation failed')
      await load()
    } catch (e) {
      console.error(e)
      alert('Generation error')
    } finally {
      setGenerating(null)
    }
  }

  const generate360Set = async () => {
    setGenerating('set')
    try {
      const res = await fetch(`/v1/characters/${characterRefId}/generate-360-set`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!data?.success) alert(data?.error || 'Generation failed')
      await load()
    } catch (e) {
      console.error(e)
      alert('Generation error')
    } finally {
      setGenerating(null)
    }
  }

  const deleteImage = async (imageId: string) => {
    if (!confirm('Delete this image? This removes local media and metadata.')) return
    try {
      const res = await fetch(`/v1/characters/${characterRefId}/images/${imageId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data?.success) alert(data?.error || 'Delete failed')
      await load()
    } catch (e) {
      console.error(e)
      alert('Delete error')
    }
  }

  const latestReference = React.useMemo(() => {
    return images.find((img) => img?.kind === 'reference')
  }, [images])

  const latestReferenceUrl = React.useMemo(() => {
    if (!latestReference) return undefined
    const media = latestReference.media
    return typeof media === 'object' ? media?.url || media?.sizes?.card?.url : undefined
  }, [latestReference])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Character Images</h1>
        <div className="mt-1 text-sm text-gray-700 flex flex-wrap items-center gap-3">
          {character?.name ? <span className="font-medium">{character.name}</span> : null}
          {character?.libraryDbId ? (
            <a
              className="text-blue-600 underline"
              href={`https://character.ft.tc/dashboard/character-profile/${character.libraryDbId}`}
              target="_blank"
              rel="noreferrer noopener"
              title="Open in Character Library dashboard"
            >
              libraryDbId: <code>{character.libraryDbId}</code>
            </a>
          ) : (
            <span>
              libraryDbId: <code>n/a</code>
            </span>
          )}
          <span>
            libraryCharacterId: <code>{character?.libraryCharacterId || 'n/a'}</code>
          </span>
        </div>
      </div>

      {/* Latest Generated Reference (blank if not yet generated) */}
      <div className="mb-6">
        <h2 className="font-medium mb-2">Latest Generated Reference</h2>
        {latestReferenceUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={latestReferenceUrl}
            alt="latest reference"
            className="w-full max-w-md h-auto rounded border"
          />
        ) : (
          <div className="w-full max-w-md h-40 bg-gray-50 border rounded flex items-center justify-center text-sm text-gray-500">
            Not generated yet
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">Reference Image</h2>
          <textarea
            className="w-full border rounded p-2 text-sm mb-2"
            rows={4}
            placeholder="Edit prompt here (optional)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={generating === 'ref'}
              onClick={generateReference}
            >
              {generating === 'ref' ? 'Generating…' : 'Generate Reference'}
            </button>
            <button
              className="px-3 py-2 border rounded text-sm"
              disabled={generating === 'ref'}
              title="Reset prompt to the server-suggested value"
              onClick={async () => {
                try {
                  const res = await fetch(`/v1/characters/${characterRefId}/initial-image-prompt`, {
                    cache: 'no-store',
                  })
                  const data = await res.json()
                  if (data?.success && typeof data.prompt === 'string') setPrompt(data.prompt)
                } catch (e) {
                  console.warn('Failed to reset prompt', e)
                }
              }}
            >
              Reset Prompt
            </button>
            <span className="ml-2 inline-flex items-center rounded border px-2 py-0.5 text-xs text-gray-700 bg-gray-50">
              Template v1.1
            </span>
            <a
              className="text-xs text-blue-600 underline ml-2"
              href={`/v1/characters/${characterRefId}/initial-image-prompt`}
              target="_blank"
              rel="noreferrer noopener"
              title="Open raw server prompt"
            >
              View raw prompt
            </a>
          </div>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-medium mb-2">360° Portfolio</h2>
          <p className="text-sm text-gray-600 mb-2">
            Generates a set of images covering multiple angles.
          </p>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={generating === 'set'}
            onClick={generate360Set}
          >
            {generating === 'set' ? 'Generating…' : 'Generate 360° Set'}
          </button>
        </div>
      </div>

      <div className="border rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Images</h2>
          <button className="text-sm underline" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {images.length === 0 ? (
          <div>
            {character?.libraryAssets?.masterReferencePublicUrl ? (
              <div className="mb-3">
                <div className="text-sm text-gray-700 mb-1">
                  External master reference (not yet ingested)
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={character.libraryAssets.masterReferencePublicUrl}
                  alt="master reference"
                  className="w-full max-w-md h-auto rounded border"
                />
              </div>
            ) : (
              <div className="text-sm text-gray-600">No images yet.</div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => {
              const media = img.media
              const url =
                typeof media === 'object' ? media?.url || media?.sizes?.card?.url : undefined
              const kind = img.kind
              return (
                <div key={img.id} className="border rounded overflow-hidden">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={kind} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      No preview
                    </div>
                  )}
                  <div className="p-2 flex items-center justify-between text-xs">
                    <span className="uppercase text-gray-600">{kind}</span>
                    <button className="text-red-600" onClick={() => deleteImage(img.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ImagesPage() {
  const params = useParams()
  const id = (params as any)?.characterId as string | undefined
  if (!id) return <div className="p-6">Character reference not found.</div>
  return <ImagesClient characterRefId={id} />
}
