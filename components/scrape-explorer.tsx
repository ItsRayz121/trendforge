"use client";

import { useState } from "react";
import { useScrape, useGoogleTrends, useNewsSearch } from "@/hooks/useScrape";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Newspaper, Image, Loader2, ExternalLink } from "lucide-react";

export function ScrapeExplorer() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");

  const {
    data,
    loading,
    error,
    scrape,
    clear,
  } = useScrape();

  const handleSearch = () => {
    if (!query.trim()) return;
    scrape(query, { type: activeTab as any });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">SerpAPI Explorer</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="news">
            <Newspaper className="w-4 h-4 mr-2" />
            News
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="w-4 h-4 mr-2" />
            Images
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={`Search for ${activeTab}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Searching..." : "Search"}
            </Button>
            {data && (
              <Button variant="outline" onClick={clear}>
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={data.source === "serpapi" ? "success" : "info"}>
                  {data.source === "serpapi" ? "Live Data" : "Demo Data"}
                </Badge>
                {data.totalResults && (
                  <span className="text-sm text-muted-foreground">
                    {data.totalResults} results
                  </span>
                )}
              </div>

              <TabsContent value="search" className="mt-0">
                <SearchResults data={data.results} />
              </TabsContent>

              <TabsContent value="trends" className="mt-0">
                <TrendsResults data={data.results} />
              </TabsContent>

              <TabsContent value="news" className="mt-0">
                <NewsResults data={data.results} />
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <ImagesResults data={data.results} />
              </TabsContent>
            </div>
          )}
        </div>
      </Tabs>
    </Card>
  );
}

function SearchResults({ data }: { data: any }) {
  if (!data || !data.organic) return null;

  return (
    <div className="space-y-4">
      {data.featuredSnippet && (
        <Card className="p-4 bg-blue-50/50 border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Featured Snippet</p>
          <h4 className="font-semibold mb-1">{data.featuredSnippet.title}</h4>
          <p className="text-sm text-muted-foreground">{data.featuredSnippet.snippet}</p>
        </Card>
      )}

      <div className="space-y-3">
        {data.organic.map((result: any, i: number) => (
          <a
            key={i}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 mb-1">{result.displayedUrl}</p>
                <h4 className="font-semibold text-blue-600 hover:underline mb-1">
                  {result.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.snippet}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {data.relatedQuestions?.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Related Questions</h4>
          <div className="space-y-2">
            {data.relatedQuestions.map((q: any, i: number) => (
              <div key={i} className="border-b last:border-0 pb-2 last:pb-0">
                <p className="font-medium text-sm">{q.question}</p>
                <p className="text-sm text-muted-foreground">{q.snippet}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TrendsResults({ data }: { data: any }) {
  if (!data || !data.timeline) return null;

  const maxValue = Math.max(...data.timeline.map((t: any) => t.value));

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-semibold mb-4">Interest Over Time</h4>
        <div className="h-32 flex items-end gap-1">
          {data.timeline.slice(-12).map((point: any, i: number) => (
            <div
              key={i}
              className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
              style={{ height: `${(point.value / maxValue) * 100}%` }}
              title={`${point.date}: ${point.value}`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Avg Volume: {data.avgSearchVolume?.toLocaleString()}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Related Topics</h4>
          <div className="space-y-2">
            {data.relatedTopics?.slice(0, 5).map((topic: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{topic.topic}</span>
                <Badge variant="default">{topic.value}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-semibold mb-3">Related Queries</h4>
          <div className="space-y-2">
            {data.relatedQueries?.slice(0, 5).map((q: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{q.query}</span>
                <Badge variant="default">{q.value}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function NewsResults({ data }: { data: any[] }) {
  if (!Array.isArray(data)) return null;

  return (
    <div className="space-y-3">
      {data.map((article: any, i: number) => (
        <a
          key={i}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex gap-4">
            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-24 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">{article.source}</Badge>
                <span className="text-xs text-muted-foreground">{article.date}</span>
              </div>
              <h4 className="font-semibold mb-1">{article.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{article.snippet}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
}

function ImagesResults({ data }: { data: any[] }) {
  if (!Array.isArray(data)) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((img: any, i: number) => (
        <a
          key={i}
          href={img.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-lg border"
        >
          <img
            src={img.thumbnail}
            alt={img.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="absolute bottom-2 left-2 right-2 text-xs text-white line-clamp-2">
              {img.title}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
