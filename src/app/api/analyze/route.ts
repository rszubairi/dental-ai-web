import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for the standalone x-ray upload-and-analyze test page.
 * Forwards the uploaded file to the Python inference service's
 * /v1/infer-upload endpoint -- kept server-side (not called from the
 * browser directly) so the inference service never needs to be exposed
 * publicly and there's no CORS setup to maintain.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const model = formData.get("model");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const inferenceUrl = process.env.INFERENCE_SERVICE_URL ?? "http://localhost:8000";

  const upstreamForm = new FormData();
  upstreamForm.set("file", file, (file as File).name ?? "upload.png");
  upstreamForm.set("model", typeof model === "string" ? model : "full_assessment");

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${inferenceUrl}/v1/infer-upload`, {
      method: "POST",
      body: upstreamForm,
    });
  } catch {
    return NextResponse.json(
      { error: `Could not reach the inference service at ${inferenceUrl}. Is it running?` },
      { status: 502 },
    );
  }

  if (!upstreamResponse.ok) {
    const detail = await upstreamResponse.text();
    return NextResponse.json(
      { error: `Inference service returned ${upstreamResponse.status}: ${detail}` },
      { status: 502 },
    );
  }

  const result = await upstreamResponse.json();
  return NextResponse.json(result);
}
