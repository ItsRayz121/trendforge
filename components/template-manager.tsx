"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FormGroup } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Platform } from "@/lib/types";
import { platforms } from "@/data/platforms";
import { Save, Trash2, Plus, FileText, Edit2, X, Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  platform: Platform;
  prompt: string;
  description: string;
  isDefault?: boolean;
}

interface TemplateManagerProps {
  selectedPlatform: Platform;
  onSelectTemplate: (template: Template) => void;
  currentTemplate?: Template | null;
}

const defaultTemplates: Record<Platform, Template[]> = {
  instagram: [
    {
      id: "insta-default",
      name: "Standard Post",
      platform: "instagram",
      prompt: "Create an engaging Instagram caption with emojis, relevant hashtags, and a clear call-to-action. Include line breaks for readability.",
      description: "General purpose Instagram post with hashtags",
      isDefault: true,
    },
    {
      id: "insta-educational",
      name: "Educational Carousel",
      platform: "instagram",
      prompt: "Create an educational Instagram caption that teases valuable insights. Use hooks to encourage saving the post. Include 5-7 carousel slide titles.",
      description: "Carousel post with educational value",
    },
    {
      id: "insta-story",
      name: "Story Highlights",
      platform: "instagram",
      prompt: "Create a relatable Instagram story script with poll stickers, question boxes, and swipe-up prompts. Keep it conversational.",
      description: "Instagram Stories with interactive elements",
    },
  ],
  twitter: [
    {
      id: "twitter-default",
      name: "Single Tweet",
      platform: "twitter",
      prompt: "Create a punchy tweet under 280 characters. Use 1-2 relevant hashtags. Make it shareable and engaging.",
      description: "Standard tweet optimized for engagement",
      isDefault: true,
    },
    {
      id: "twitter-thread",
      name: "Viral Thread",
      platform: "twitter",
      prompt: "Create a Twitter thread with a strong hook tweet followed by value-packed tweets. Number them clearly. End with a CTA.",
      description: "Multi-tweet thread for deeper topics",
    },
  ],
  linkedin: [
    {
      id: "linkedin-default",
      name: "Professional Post",
      platform: "linkedin",
      prompt: "Create a professional LinkedIn post with a compelling opening, 3-4 paragraphs of value, and a question at the end. Use line breaks between paragraphs.",
      description: "Standard professional LinkedIn content",
      isDefault: true,
    },
    {
      id: "linkedin-story",
      name: "Personal Story",
      platform: "linkedin",
      prompt: "Share a personal professional story with a challenge, action taken, and lesson learned. End with an engaging question.",
      description: "Narrative-style LinkedIn post",
    },
  ],
  telegram: [
    {
      id: "telegram-default",
      name: "Channel Post",
      platform: "telegram",
      prompt: "Create a Telegram channel post that's conversational and informative. Use minimal formatting. Include a link or resource.",
      description: "Standard Telegram channel message",
      isDefault: true,
    },
  ],
  facebook: [
    {
      id: "facebook-default",
      name: "Page Post",
      platform: "facebook",
      prompt: "Create a Facebook page post with a friendly tone. Include emojis and a question to encourage comments.",
      description: "Standard Facebook page content",
      isDefault: true,
    },
  ],
};

export function TemplateManager({ selectedPlatform, onSelectTemplate, currentTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    platform: selectedPlatform,
    prompt: "",
    description: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("trendforge_templates");
    if (stored) {
      const parsed = JSON.parse(stored);
      setTemplates(parsed);
    } else {
      // Load default templates
      const allDefaults = Object.values(defaultTemplates).flat();
      setTemplates(allDefaults);
      localStorage.setItem("trendforge_templates", JSON.stringify(allDefaults));
    }
  }, []);

  useEffect(() => {
    setNewTemplate((prev) => ({ ...prev, platform: selectedPlatform }));
  }, [selectedPlatform]);

  const saveToStorage = (updatedTemplates: Template[]) => {
    localStorage.setItem("trendforge_templates", JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
  };

  const handleAdd = () => {
    if (!newTemplate.name || !newTemplate.prompt) return;

    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      platform: selectedPlatform,
      prompt: newTemplate.prompt,
      description: newTemplate.description || "",
    };

    const updated = [...templates, template];
    saveToStorage(updated);
    setNewTemplate({ name: "", platform: selectedPlatform, prompt: "", description: "" });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveToStorage(updated);
  };

  const platformTemplates = templates.filter((t) => t.platform === selectedPlatform);
  const platformInfo = platforms.find((p) => p.id === selectedPlatform);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300">
          Templates for {platformInfo?.label}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Template"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-violet-500/20">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <FormGroup>
                <Label required>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Marketing Hook Style"
                />
              </FormGroup>
              <FormGroup>
                <Label>Description</Label>
                <Input
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description of when to use this template"
                />
              </FormGroup>
              <FormGroup>
                <Label required>Custom Prompt Instructions</Label>
                <Textarea
                  value={newTemplate.prompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
                  placeholder="Describe how the AI should generate content for this platform..."
                  className="min-h-[100px] text-xs"
                />
              </FormGroup>
              <Button onClick={handleAdd} disabled={!newTemplate.name || !newTemplate.prompt}>
                <Save className="w-4 h-4" />
                Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {platformTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              currentTemplate?.id === template.id
                ? "bg-violet-500/10 border-violet-500/30"
                : "bg-surface-800 border-surface-600 hover:border-surface-500"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-slate-200">{template.name}</p>
                  {template.isDefault && (
                    <Badge variant="default" className="text-[10px]">Default</Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{template.description}</p>
                )}
              </div>
              {!template.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(template.id);
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { Template };
