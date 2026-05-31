import "./globals.css";

export const metadata = {
  title: "FG Portas",
  description: "Sistema administrativo FG Portas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}