"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select } from "./ui/select";
import { Toast } from "./ui/toast";
import { learningAssetTypes } from "../lib/learning-suite";

interface LearningSuiteProps {
  courseId: string;
}

export function LearningSuite({ courseId }: LearningSuiteProps) {
  const [assets, setAssets] = useState<Array<{ id: string; title: string; content: string; assetType: string; mode: string }>>([]);
  const [type, setType] = useState<(typeof learningAssetTypes)[number]>("quiz");
  const [prompt, setPrompt] = useState("Create a concise quiz for this lesson with 3 multiple-choice questions.");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function loadAssets() {
    const response = await fetch(`/api/courses/${courseId}/assets`);
    const data = await response.json();
    if (data.assets) setAssets(data.assets);
  }

  async function handleGenerate(mode: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", type, prompt, mode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Generation failed");
      setToast("Asset generated");
      await loadAssets();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssistant() {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assistant", message: assistantMessage })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Assistant failed");
      setAssistantReply(data.reply);
      setToast("Assistant replied");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Assistant failed");
    } finally {
      setLoading(false);
    }
  }

  const groupedAssets = useMemo(() => {
    return assets.reduce<Record<string, typeof assets>>((acc, asset) => {
      acc[asset.assetType] = acc[asset.assetType] ? [...acc[asset.assetType], asset] : [asset];
      return acc;
    }, {});
  }, [assets]);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">AI Learning Suite</h3>
            <p className="text-sm text-slate-600">Generate and refine learning assets for any lesson context.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-[0.4fr_0.6fr]">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Asset type</label>
            <Select value={type} onChange={(event) => setType(event.target.value as (typeof learningAssetTypes)[number])}>
              {learningAssetTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Prompt</label>
            <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void handleGenerate("generate")} disabled={loading}>Generate</Button>
          <Button variant="outline" onClick={() => void handleGenerate("improve")} disabled={loading}>Improve</Button>
          <Button variant="secondary" onClick={() => void handleGenerate("expand")} disabled={loading}>Expand</Button>
          <Button variant="ghost" onClick={() => void handleGenerate("shorten")} disabled={loading}>Shorten</Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-950">AI Course Assistant</h3>
        <Textarea value={assistantMessage} onChange={(event) => setAssistantMessage(event.target.value)} placeholder="Ask: explain this lesson, create more exercises, or translate it" />
        <Button onClick={() => void handleAssistant()} disabled={loading}>Ask assistant</Button>
        {assistantReply ? <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{assistantReply}</div> : null}
      </Card>

      <div className="space-y-4">
        {Object.entries(groupedAssets).map(([assetType, items]) => (
          <Card key={assetType} className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{assetType}</h4>
            {items.map((asset) => (
              <div key={asset.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{asset.title}</p>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{asset.mode}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{asset.content}</p>
              </div>
            ))}
          </Card>
        ))}
      </div>

      <Toast open={Boolean(toast)} message={toast ?? ""} variant="success" onOpenChange={() => setToast(null)} />
    </div>
  );
}
