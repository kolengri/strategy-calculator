import { Header } from "../features/header";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-8 relative z-10 min-h-screen flex flex-col gap-8">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
