client<llm> OpenRouterClient {
  provider openai
  options {
    base_url env.OPENROUTER_BASE_URL
    api_key env.OPENROUTER_API_KEY
    model "anthropic/claude-sonnet-4"
    default_headers {
      "HTTP-Referer" "https://localhost:3001"
      "X-Title" "Novel Movie"
    }
  }
}

client<llm> OpenRouterAdvanced {
  provider openai
  options {
    base_url env.OPENROUTER_BASE_URL
    api_key env.OPENROUTER_API_KEY
    model "google/gemini-2.5-pro"
    default_headers {
      "HTTP-Referer" "https://localhost:3001"
      "X-Title" "Novel Movie"
    }
  }
}
