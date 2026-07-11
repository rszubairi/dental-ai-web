export function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-1/3 -left-1/4 h-[60vh] w-[60vh] rounded-full bg-primary/25 blur-3xl animate-drift-slow" />
      <div className="absolute top-1/2 -right-1/4 h-[50vh] w-[50vh] rounded-full bg-accent/40 blur-3xl animate-drift-slower" />
      <div className="absolute bottom-[-20%] left-1/3 h-[45vh] w-[45vh] rounded-full bg-chart-2/20 blur-3xl animate-drift-slow" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
