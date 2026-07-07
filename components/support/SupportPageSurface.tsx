export default function SupportPageSurface({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.16,
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-primary"
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M90 430C246 304 370 472 520 342C660 220 770 302 930 206C1090 110 1210 222 1364 104"
          stroke="currentColor"
          strokeOpacity="0.07"
          strokeWidth="2"
        />
        <path
          d="M118 188C284 250 412 104 570 178C714 244 820 148 972 214C1118 278 1226 386 1366 318"
          stroke="#10b981"
          strokeOpacity="0.055"
          strokeWidth="2"
        />
      </svg>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        {children}
      </div>
    </main>
  );
}
