export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void relative overflow-hidden">
      {/* Animated nebula gradient background */}
      <div className="absolute inset-0 nebula-bg" aria-hidden="true" />
      <div className="glass-card p-8 w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  )
}
