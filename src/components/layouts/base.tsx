import { Header } from "../features/header";
import { Footer } from "../features/footer";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 min-h-screen min-w-screen flex flex-col gap-5 max-w-6xl">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
