import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const lang = h.get("x-evi-locale") || "da-dk";

  return (
    <html lang={lang}>
      <body className="antialiased selection:bg-slate-200">
        {children}
      </body>
    </html>
  );
}
