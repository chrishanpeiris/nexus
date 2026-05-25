export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">N</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Nexus</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
