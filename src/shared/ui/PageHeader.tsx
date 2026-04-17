import { cn } from "../lib/cn";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  detail?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  detail = false,
}: PageHeaderProps) {
  return (
    <header
      className={cn("app-page-header", detail && "app-page-header--detail")}
    >
      <h1 className="app-page-header__title" id="page-title">
        {title}
      </h1>
      <p className="app-page-header__subtitle">{subtitle}</p>
    </header>
  );
}
