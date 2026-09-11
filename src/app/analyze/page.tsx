"use client";

import { useState } from "react";
import { ScanSearch, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FadeSlide } from "@/components/motion/FadeSlide";

type Detection = {
  fdi_number: string;
  bbox: number[];
  confidence: number;
  pathology?: string | null;
  pathology_confidence?: number | null;
};

type AnalyzeResult = {
  model: string;
  detections: Detection[];
  missing_teeth: string[];
  landmarks?: Record<string, number[][]> | null;
};

const MODEL_OPTIONS = [
  { value: "full_assessment", label: "Full assessment (teeth + pathology + landmarks)" },
  { value: "tooth_detection", label: "Tooth detection only" },
  { value: "landmarks", label: "Landmarks only" },
];

const PATHOLOGY_BADGE_VARIANT: Record<string, string> = {
  healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  caries: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  deep_caries: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  periapical_lesion: "bg-red-500/15 text-red-600 dark:text-red-400",
  impacted: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [model, setModel] = useState("full_assessment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("model", model);

      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ScanSearch className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Analyze x-ray</h1>
            <p className="text-sm text-muted-foreground">
              Upload a panoramic x-ray to test the AI models directly. Standalone test tool -- not linked to a
              patient case.
            </p>
          </div>
        </div>

        <FadeSlide>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="xray-file" className="text-sm font-medium">
                  X-ray image
                </label>
                <input
                  id="xray-file"
                  type="file"
                  accept="image/png,image/jpeg,.dcm,.dicom"
                  onChange={handleFileChange}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="model-select" className="text-sm font-medium">
                  Model
                </label>
                <select
                  id="model-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-9 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="X-ray preview"
                  className="max-h-96 rounded-lg border border-border/60 object-contain"
                />
              )}

              <Button onClick={handleAnalyze} disabled={!file || loading} className="gap-2">
                <Upload className="size-4" />
                {loading ? "Analyzing..." : "Analyze"}
              </Button>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        </FadeSlide>

        {result && (
          <FadeSlide>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Results ({result.model})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    Detections ({result.detections.length})
                  </h3>
                  {result.detections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No teeth detected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.detections
                        .slice()
                        .sort((a, b) => a.fdi_number.localeCompare(b.fdi_number))
                        .map((d, i) => (
                          <div
                            key={`${d.fdi_number}-${i}`}
                            className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-1.5 text-sm"
                          >
                            <span className="font-mono font-semibold">{d.fdi_number}</span>
                            <span className="text-muted-foreground">{(d.confidence * 100).toFixed(0)}%</span>
                            {d.pathology && (
                              <Badge
                                className={PATHOLOGY_BADGE_VARIANT[d.pathology] ?? ""}
                                variant="outline"
                              >
                                {d.pathology}
                                {d.pathology_confidence != null &&
                                  ` (${(d.pathology_confidence * 100).toFixed(0)}%)`}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                    Missing teeth ({result.missing_teeth.length})
                  </h3>
                  {result.missing_teeth.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None detected as missing.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missing_teeth.map((fdi) => (
                        <Badge key={fdi} variant="outline" className="font-mono">
                          {fdi}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {result.landmarks && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Landmarks</h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {Object.entries(result.landmarks).map(([name, points]) => (
                        <span key={name} className="rounded-lg border border-border/60 px-3 py-1.5">
                          <span className="font-medium">{name}</span>:{" "}
                          <span className="text-muted-foreground">{points.length} points</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeSlide>
        )}
      </div>
    </DashboardShell>
  );
}
