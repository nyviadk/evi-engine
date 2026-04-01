import { EviTestBench } from "@/src/components/EviTestBench";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <EviTestBench />
      {children}
    </main>
  );
}
