// BAML Client Configuration
// Provides a centralized way to access the BAML client with proper error handling

// Lazy-load BAML to avoid compilation issues
let bamlClient: any = null

export async function getBamlClient() {
  if (!bamlClient) {
    try {
      // Use direct import path that works in Next.js environment
      const { b } = await import('../../../baml_client')
      bamlClient = b
    } catch (error) {
      console.error('Failed to load BAML client:', error)
      throw new Error('BAML client not available')
    }
  }
  return bamlClient
}

// Re-export for convenience
export { getBamlClient as default }
