export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body className="antialiased selection:bg-slate-200">
        {/* Her kommer din Menu/Navbar senere */}
        <main>{children}</main>
        {/* Her kommer din Footer senere */}
      </body>
    </html>
  );
}
