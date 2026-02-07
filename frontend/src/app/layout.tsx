import type { Metadata } from 'next'
import './globals.css'
import { AuthDebugIndicator } from '@/components/AuthDebugIndicator'

// Set to true to show debug UI elements (auth indicator, bypass button)
const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

// Inline script to prevent theme flash on page load
const themeScript = `
(function() {
  try {
    var mode = localStorage.getItem('learning-mode');
    var theme = 'dark';
    if (mode === 'simple') theme = 'simple';
    else if (mode === 'detailed') theme = 'detailed';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--void)', color: 'var(--silver)' }}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        {DEBUG_MODE && <AuthDebugIndicator />}
      </body>
    </html>
  )
}
