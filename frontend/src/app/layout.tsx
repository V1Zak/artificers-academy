import type { Metadata } from 'next'
import './globals.css'
import { AuthDebugIndicator } from '@/components/AuthDebugIndicator'

// Set to true to show debug UI elements (auth indicator, bypass button)
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

export const metadata: Metadata = {
  title: "The Artificer's Academy",
  description: 'Learn to build MCP servers through the art of the Grand Artificer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-void text-silver antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        {DEBUG_MODE && <AuthDebugIndicator />}
      </body>
    </html>
  )
}
