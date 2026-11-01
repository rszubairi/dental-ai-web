import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { commitSample, getRunById, getRuns, getVersions, recordRun, sampleUploadUrl } from "./inferenceRuns";

const http = httpRouter();

auth.addHttpRoutes(http);

// Inference run log for the Streamlit QA viewer (see inferenceRuns.ts).
http.route({ path: "/inference-log/samples/upload-url", method: "POST", handler: sampleUploadUrl });
http.route({ path: "/inference-log/samples", method: "POST", handler: commitSample });
http.route({ path: "/inference-log/runs", method: "POST", handler: recordRun });
http.route({ path: "/inference-log/runs", method: "GET", handler: getRuns });
http.route({ path: "/inference-log/versions", method: "GET", handler: getVersions });
http.route({ path: "/inference-log/run", method: "GET", handler: getRunById });

export default http;
