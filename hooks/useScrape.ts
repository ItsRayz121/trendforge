import { useState, useCallback } from "react";

interface ScrapeResult {
  results: any;
  query: string;
  type: string;
  source: string;
  totalResults?: string;
}

interface UseScrapeOptions {
  type?: "search" | "trends" | "news" | "images";
  location?: string;
  hl?: string;
  gl?: string;
}

export function useScrape() {
  const [data, setData] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrape = useCallback(
    async (query: string, options: UseScrapeOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          type: options.type || "search",
          ...(options.location && { location: options.location }),
          ...(options.hl && { hl: options.hl }),
          ...(options.gl && { gl: options.gl }),
        });

        const response = await fetch(`/api/scrape?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    scrape,
    clear,
  };
}

// Pre-built hooks for specific use cases

export function useGoogleSearch() {
  const { scrape, ...rest } = useScrape();

  const search = useCallback(
    (query: string, options?: Omit<UseScrapeOptions, "type">) =>
      scrape(query, { ...options, type: "search" }),
    [scrape]
  );

  return { search, ...rest };
}

export function useGoogleTrends() {
  const { scrape, ...rest } = useScrape();

  const getTrends = useCallback(
    (query: string, options?: Omit<UseScrapeOptions, "type">) =>
      scrape(query, { ...options, type: "trends" }),
    [scrape]
  );

  return { getTrends, ...rest };
}

export function useNewsSearch() {
  const { scrape, ...rest } = useScrape();

  const searchNews = useCallback(
    (query: string, options?: Omit<UseScrapeOptions, "type">) =>
      scrape(query, { ...options, type: "news" }),
    [scrape]
  );

  return { searchNews, ...rest };
}
