export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pass-through — each auth page owns its full-screen layout
  return <>{children}</>;
}
