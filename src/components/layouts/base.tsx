import { Header } from "../features/header";

export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Header />
      {children}
    </div>
  );
}
