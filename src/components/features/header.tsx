import logo from "@/assets/logo.svg";
import { LanguageSelector } from "./language-selector";

export function Header() {
  return (
    <header>
      <img src={logo} alt="Logo" />
      <h1>Header</h1>
      <LanguageSelector />
    </header>
  );
}
