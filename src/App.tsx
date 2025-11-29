import "./index.css";

import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.svg";
import { Home } from "./pages/home";

export function App() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("app.title")}</title>
        <meta name="description" content={t("app.description")} />
        <link rel="icon" type="image/svg+xml" href={logo} />
      </Helmet>

      <Home />
    </>
  );
}

export default App;
``;
