"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FormGroup } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Platform } from "@/lib/types";
import { platforms } from "@/data/platforms";
import { Save, Trash2, Plus, Edit2, X, Check, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Template {
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
      description: "General purpose post with hashtags",
      isDefault: true,
    },
    {
      id: "insta-educational",
      name: "Educational Carousel",
      platform: "instagram",
      prompt: "Create an educational Instagram caption that teases valuable insights. Use hooks to encourage saving the post. Include 5-7 carousel slide titles.",
      description: "Carousel with educational value",
    },
    {
      id: "insta-story",
      name: "Story Highlights",
      platform: "instagram",
      prompt: "Create a relatable Instagram story script with poll stickers, question boxes, and swipe-up prompts. Keep it conversational.",
      description: "Stories with interactive elements",
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
      description: "Standard professional content",
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

const emptyDraft = { name: "", prompt: "", description: "" };

export function TemplateManager({ selectedPlatform, onSelectTemplate, currentTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [editDraft, setEditDraft] = useState(emptyDraft);

  useEffect(() => {
    const stored = localStorage.getItem("trendforge_templates");
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      const all = Object.values(defaultTemplates).flat();
      setTemplates(all);
      localStorage.setItem("trendforge_templates", JSON.stringify(all));
    }
  }, []);

  useEffect(() => {
    // Close edit mode when platform switches
    setEditingId(null);
    setShowForm(false);
  }, [selectedPlatform]);

  const persist = (updated: Template[]) => {
    localStorage.setItem("trendforge_templates", JSON.stringify(updated));
    setTemplates(updated);
  };

  const handleAdd = () => {
    if (!draft.name.trim() || !draft.prompt.trim()) return;
    const t: Template = {
      id: Date.now().toString(),
      name: draft.name.trim(),
      platform: selectedPlatform,
      prompt: draft.prompt.trim(),
      description: draft.description.trim(),
    };
    persist([...templates, t]);
    setDraft(emptyDraft);
    setShowForm(false);
  };

  const handleStartEdit = (t: Template) => {
    setEditingId(t.id);
    setEditDraft({ name: t.name, prompt: t.prompt, description: t.description });
    setShowForm(false);
  };

  const handleSaveEdit = (id: string) => {
    if (!editDraft.name.trim() || !editDraft.prompt.trim()) return;
    persist(
      templates.map((t) =>
        t.id === id
          ? { ...t, name: editDraft.name.trim(), prompt: editDraft.prompt.trim(), description: editDraft.description.trim() }
          : t
      )
    );
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    persist(templates.filter((t) => t.id !== id));
  };

  const platformTemplates = templates.filter((t) => t.platform === selectedPlatform);
  const platformInfo = platforms.find((p) => p.id === selectedPlatform);

  return (
    <div className="space-y-2">
      {/* Template list */}
      {platformTemplates.map((template) => {
        const isSelected = currentTemplate?.id === template.id;
        const isEditing = editingId === template.id;

        return (
          <div
            key={template.id}
            className={cn(
              "rounded-lg border transition-all duration-200 overflow-hidden",
              isSelected
                ? "border-violet-500/40 bg-violet-500/8"
                : "border-surface-500 bg-surface-800 hover:border-surface-400"
            )}
          >
            {isEditing ? (
              /* ── Edit Mode ── */
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Editing Template</span>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <FormGroup>
                  <Label required>Name</Label>
                  <Input
                    value={editDraft.name}
                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                    placeholder="Template name"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <Input
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                    placeholder="Short description"
                  />
                </FormGroup>
                <FormGroup>
                  <Label required>Prompt Instructions</Label>
                  <Textarea
                    value={editDraft.prompt}
                    onChange={(e) => setEditDraft({ ...editDraft, prompt: e.target.value })}
                    className="min-h-[90px] text-xs"
                    placeholder="Describe how AI should generate content..."
                  />
                </FormGroup>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(template.id)}
                    disabled={!editDraft.name.trim() || !editDraft.prompt.trim()}
                    className="flex-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <div
                className="p-3 cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                      isSelected ? "bg-violet-400" : "bg-surface-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-violet-300" : "text-slate-200"
                        )}>
                          {template.name}
                        </span>
                        {template.isDefault && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-600 border border-surface-400 text-slate-500 font-medium uppercase tracking-wider">
                            Default
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-400 font-medium uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{template.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartEdit(template); }}
                      className="p-1.5 rounded-md text-slate-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                      title="Edit template"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {!template.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                        className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete template"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new template form */}
      {showForm ? (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">New Template</span>
            <button
              onClick={() => { setShowForm(false); setDraft(emptyDraft); }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <FormGroup>
            <Label required>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Marketing Hook Style"
            />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="When to use this template"
            />
          </FormGroup>
          <FormGroup>
            <Label required>Prompt Instructions</Label>
            <Textarea
              value={draft.prompt}
              onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              className="min-h-[90px] text-xs"
              placeholder="Describe how the AI should generate content for this platform..."
            />
          </FormGroup>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!draft.name.trim() || !draft.prompt.trim()}
              className="flex-1"
            >
              <Save className="w-3.5 h-3.5" />
              Save Template
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setDraft(emptyDraft); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-surface-500 text-xs text-slate-500 hover:text-violet-400 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Template for {platformInfo?.label}
        </button>
      )}
    </div>
  );
}
