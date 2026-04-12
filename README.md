# Orchestrator UI

Интерфейс админки процессов orchestration backend.

## Локальный запуск

1. Установить зависимости:

```bash
npm ci
```

2. Создать локальный env-файл и указать backend:

```bash
cp .env.example .env
```

`BASE_URL` должен указывать на backend без завершающего `/`.

3. Запустить dev-сервер:

```bash
npm run dev
```

По умолчанию UI будет доступен на `http://localhost:5173`, а запросы к `/api` Vite проксирует в `BASE_URL`.

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
docker run --rm -p 8080:8080 -e BASE_URL=http://host.docker.internal:8080 orchestrator-ui:local
```

Контейнер отдает UI на `http://localhost:8080`, а `/api` проксирует в `BASE_URL`.

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
