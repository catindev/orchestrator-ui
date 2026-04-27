import { Link } from "react-router-dom";
import type { SubprocessListItem } from "../types";
import { ProcessStatusBadge } from "./ProcessStatusBadge";

type SubprocessesListProps = {
  parentProcessId: string;
  subprocesses: SubprocessListItem[];
};

export function SubprocessesList({
  parentProcessId,
  subprocesses,
}: SubprocessesListProps) {
  if (subprocesses.length === 0) {
    return <p className="app-empty-text">Подпроцессов нет </p>;
  }

  return (
    <div className="process-tab-list">
      {subprocesses.map((subprocess) => (
        <Link
          className="process-tab-list__row process-tab-list__row--subprocess process-tab-list__row--link"
          key={subprocess.processId}
          to={`/processes/${parentProcessId}/subprocesses/${subprocess.processId}`}
        >
          <div className="process-tab-list__meta process-tab-list__meta--wide">
            <span className="process-tab-list__label">Подпроцесс</span>
            <span className="process-tab-list__value" title={subprocess.title}>
              {subprocess.title}
            </span>
            <span
              className="process-tab-list__description"
              title={subprocess.summary}
            >
              {subprocess.summary}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Текущий этап</span>
            <span
              className="process-tab-list__value"
              title={subprocess.stageLabel}
            >
              {subprocess.stageLabel}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Обновлено</span>
            <span
              className="process-tab-list__value"
              title={subprocess.updatedAt}
            >
              {subprocess.updatedAt}
            </span>
            <span
              className="process-tab-list__description"
              title={`Создан ${subprocess.createdAt}`}
            >
              Создан {subprocess.createdAt}
            </span>
          </div>

          <ProcessStatusBadge
            label={subprocess.statusLabel}
            tone={subprocess.statusTone}
          />
        </Link>
      ))}
    </div>
  );
}
