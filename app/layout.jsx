export const metadata = {
  title: "Case Opener 3D",
  description: "Stunning 3D RNG case opening game"
};

import "../styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
