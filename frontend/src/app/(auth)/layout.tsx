export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="scroll-container p-8 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
