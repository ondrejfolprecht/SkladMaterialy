import "./globals.css";

export const metadata = {
  title: "Sklad tiskovin",
  description: "Interní evidence tiskových materiálů",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
