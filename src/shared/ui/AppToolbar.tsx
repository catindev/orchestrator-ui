import { Link, useLocation } from "react-router-dom";
import { OrchestratorServerControl } from "./OrchestratorServerControl";

function getSectionLabel(pathname: string) {
  if (pathname === "/") {
    return "Все заявки на регистрацию";
  }

  if (pathname.includes("/subprocesses/")) {
    return "Подпроцесс";
  }

  if (pathname.startsWith("/processes/")) {
    return "Заявка";
  }

  return "Админка";
}

export function AppToolbar() {
  const { pathname } = useLocation();
  const sectionLabel = getSectionLabel(pathname);

  return (
    <header className="app-toolbar">
      <Link className="app-toolbar__brand" to="/">
        <span className="app-toolbar__brand-mark" aria-hidden="true">
          Б
        </span>
      </Link>

      <div className="app-toolbar__breadcrumbs" aria-label="Навигация">
        <span className="app-toolbar__crumb">
          Бенефициары номинальных счетов
        </span>
        <span className="app-toolbar__crumb-separator" aria-hidden="true">
          /
        </span>
        <span className="app-toolbar__crumb app-toolbar__crumb--current">
          {sectionLabel}
        </span>
      </div>

      <div className="app-toolbar__actions">
        <OrchestratorServerControl />
      </div>
    </header>
  );
}
