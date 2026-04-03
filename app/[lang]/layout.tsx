import { EviTestBench } from "@/src/components/EviTestBench";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Temp header — replace with real <EviNavigation /> later */}
      <header className="theme-dark px-6 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-lg font-bold">Logo</span>
          <ul className="flex gap-6 text-sm">
            <li><a href="#">Link 1</a></li>
            <li><a href="#">Link 2</a></li>
            <li><a href="#">Link 3</a></li>
          </ul>
        </nav>
      </header>

      <main>
        <EviTestBench />
        {children}
      </main>

      {/* Temp footer — replace with real <EviFooter /> later */}
      <footer className="theme-dark px-6 py-8">
        <div className="mx-auto max-w-7xl text-sm opacity-60">
          &copy; 2026 Company Name — Placeholder footer
        </div>
      </footer>
    </>
  );
}
