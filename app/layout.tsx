import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { initializeDatabase } from "@/lib/db"

const inter = Inter({ subsets: ["latin"] })

// Initialize the database on application startup
initializeDatabase().catch(console.error)

export const metadata = {
  title: "PIKNIK - Potluck Event Organizer",
  description: "Organize and participate in potluck events with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'