# Нонограммы Код Рисунка

React/Vite-проект для Яндекс Игр и GitHub Pages.

## Запуск локально

```bash
npm install
npm run dev
```

Если PowerShell блокирует `npm`, используй:

```powershell
npm.cmd install
npm.cmd run dev
```

## Сборка

```bash
npm run build
```

Готовые файлы появятся в `dist`.

## Загрузка в Яндекс Игры

Для Яндекс Игр архивируй только содержимое папки `dist`, а не весь проект. В корне архива должен быть ровно один `index.html`.

Правильная структура архива:

```text
index.html
yandex-sdk.js
assets/
```

## GitHub Pages

В проекте уже есть workflow `.github/workflows/deploy.yml`. В настройках репозитория нужно выбрать:

```text
Settings → Pages → Source: GitHub Actions
```

После `git push` GitHub сам выполнит `npm ci`, `npm run build` и опубликует `dist`.
