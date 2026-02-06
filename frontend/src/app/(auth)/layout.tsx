export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-void">
      <div className="glass-card p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
