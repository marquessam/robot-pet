import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Robot Pet",
  description: "A virtual robot pet companion",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
