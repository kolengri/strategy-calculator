import { Header } from "../features/header";
import { Footer } from "../features/footer";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 min-h-screen flex flex-col gap-5">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
