import "./globals.css";

export const metadata = {
  title: "Simplex Map",
  description: "Amateur Radio Simplex Communication Map",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
