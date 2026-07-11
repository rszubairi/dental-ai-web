/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiJobs from "../aiJobs.js";
import type * as auditLogs from "../auditLogs.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as cases from "../cases.js";
import type * as http from "../http.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_tenant from "../lib/tenant.js";
import type * as licensing from "../licensing.js";
import type * as patients from "../patients.js";
import type * as pricing from "../pricing.js";
import type * as quotations from "../quotations.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as stats from "../stats.js";
import type * as tenants from "../tenants.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiJobs: typeof aiJobs;
  auditLogs: typeof auditLogs;
  auth: typeof auth;
  billing: typeof billing;
  cases: typeof cases;
  http: typeof http;
  "lib/email": typeof lib_email;
  "lib/tenant": typeof lib_tenant;
  licensing: typeof licensing;
  patients: typeof patients;
  pricing: typeof pricing;
  quotations: typeof quotations;
  reports: typeof reports;
  seed: typeof seed;
  stats: typeof stats;
  tenants: typeof tenants;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
