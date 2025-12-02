import { Header } from "../features/header";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16 relative z-10 min-h-screen min-w-screen flex flex-col gap-8 sm:gap-10 max-w-7xl">
      <Header />
      <main className="flex-1 w-full animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        {children}
      </main>
    </div>
  );
}
