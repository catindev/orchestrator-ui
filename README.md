# Orchestrator UI

Интерфейс админки для разбора процессов регистрации бенефициаров номинальных счетов.

## Что умеет интерфейс

- показывает список корневых процессов с поиском по `ID заявки`, `ИНН`, ФИО, `ID в системе мерчанта`, номеру счета, email и телефону;
- открывает отдельные страницы root-процесса и подпроцесса;
- группирует шаги по бизнес-этапам, а не только показывает сырой `workflow`;
- показывает payload, ответы интеграций, decisions и служебные идентификаторы в контексте конкретного шага;
- в этапе `Регистрация в АБС` у root-процесса показывает короткий итог подпроцесса и ссылку для перехода в него вместо дублирования всех его внутренних шагов;
- позволяет менять адрес backend прямо из UI через компонент `Сервер заявок`.

## Локальный запуск

1. Установить зависимости:

```bash
npm ci
```

2. Создать локальный env-файл и указать backend:

```bash
cp .env.example .env
```

`ORCHESTRATOR_BASE_URL` должен указывать на orchestration backend без завершающего `/`.

3. Запустить dev-сервер:

```bash
npm run dev
```

По умолчанию UI будет доступен на `http://localhost:5173`, а сервер заявок в режиме `npm run dev` будет `http://localhost:8080`. Для остальных окружений default-сервер заявок — `https://j-nominal-beneficiaries.preprod.transcapital.com`. Значение можно переопределить через `ORCHESTRATOR_BASE_URL` или через контрол `Сервер заявок` в UI.

## Production build

```bash
npm run build
```

Готовая статика появится в `dist/`.

## Docker

Собрать образ:

```bash
docker build -t orchestrator-ui:local .
```

Запустить контейнер:

```bash
docker run --rm -p 8080:8080 -e BASE_URL=https://j-nominal-beneficiaries.preprod.transcapital.com orchestrator-ui:local
```

Контейнер отдает UI на `http://localhost:8080`, а `/api` проксирует в `BASE_URL`. Если `BASE_URL` не переопределен, в UI default-сервером заявок остается preprod-контур.

Важно:

- в локальной разработке через Vite используется `ORCHESTRATOR_BASE_URL`;
- в Docker и Kubernetes nginx-прокси использует `BASE_URL`.

## Kubernetes

В каталоге [`k8s`](/Users/vladimirtitskiy/Work/orchectrator-ui/k8s) лежат базовые манифесты:

- `configmap.yaml` с `BASE_URL`
- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`
- `kustomization.yaml`

Перед применением:

1. Обновить `image` в [`k8s/deployment.yaml`](/Users/vladimirtitskiy/Work/orchectrator-ui/k8s/deployment.yaml)
2. Проверить `BASE_URL` в [`k8s/configmap.yaml`](/Users/vladimirtitskiy/Work/orchectrator-ui/k8s/configmap.yaml)
3. Поменять host в [`k8s/ingress.yaml`](/Users/vladimirtitskiy/Work/orchectrator-ui/k8s/ingress.yaml)

Применить:

```bash
kubectl apply -k k8s
```
