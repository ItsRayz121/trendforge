"use client";
import { useState } from "react";
import { TopicForm } from "./topic-form";
import { OutputTabs } from "./output-tabs";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { generateContent } from "@/lib/ai";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";
import { Wand2 } from "lucide-react";

export function DashboardWorkspace() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GenerateResponse | null>(null);

  const handleGenerate = async (req: GenerateRequest) => {
    setLoading(true);
    try {
      const result = await generateContent(req);
      setResponse(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-400" />
              Quick Generate
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm onGenerate={handleGenerate} loading={loading} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Output Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <OutputTabs response={response} />
        </CardContent>
      </Card>
    </div>
  );
}
