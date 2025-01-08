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
      <body className="min-h-screen w-full flex flex-col">
        {/* A top-level container that could be used for global layout adjustments */}
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  )
}
