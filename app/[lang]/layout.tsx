import { EviTestBench } from "@/src/components/EviTestBench";
import { EviNavigation } from "@/src/components/EviNavigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EviNavigation />

      <EviTestBench />
      {children}

      {/* Temp footer — replace with real <EviFooter /> later */}
      <footer></footer>
    </>
  );
}
