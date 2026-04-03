import { EviTestBench } from "@/src/components/EviTestBench";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Temp header — replace with real <EviNavigation /> later */}
      <header></header>

      <main>
        <EviTestBench />
        {children}
      </main>

      {/* Temp footer — replace with real <EviFooter /> later */}
      <footer></footer>
    </>
  );
}
