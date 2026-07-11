import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Next.js 16 renamed `middleware.ts` -> `proxy.ts`; this replaces the old middleware convention.
export default convexAuthNextjsMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};
