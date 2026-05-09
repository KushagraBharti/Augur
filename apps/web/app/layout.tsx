import "./styles.css";

export const metadata = {
  title: "Augur - Texas Intelligence for Businesses",
  description: "Texas public-data intelligence for retail landlords and development teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
