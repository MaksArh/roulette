# 22 Hub - Система "Рулетка"

Система отображения состояния игровых столов рулетки в режиме реального времени.

## Технический стек

- **Бэкенд**: Node.js + TypeScript + Express
- **База данных**: MongoDB
- **WebSocket**: Socket.IO
- **Контейнеризация**: Docker

## Структура проекта

- **src/** - исходный код бэкенда
  - **config/** - настройки и константы
  - **middleware/** - промежуточные обработчики запросов
  - **routes/** - маршруты API
  - **services/** - сервисы для работы с данными
  - **socket/** - логика WebSocket соединений
  - **types/** - TypeScript интерфейсы
  - **utils/** - вспомогательные функции
  - **server.ts** - входная точка приложения
- **public/** - фронтенд
  - **index.html** - страница выбора стола
  - **admin.html** - панель администратора
  - **table.html** - страница отображения стола

## Установка и запуск

### Запуск с использованием Docker

1. Убедитесь, что Docker и Docker Compose установлены на вашей системе
2. Клонируйте репозиторий
3. Запустите систему:

```bash
docker-compose up -d
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### Локальный запуск для разработки

1. Установите Node.js и MongoDB
2. Клонируйте репозиторий
3. Установите зависимости:

```bash
npm install
```

4. Запустите MongoDB
5. Запустите приложение в режиме разработки:

```bash
npm run dev
```

## Использование системы

### Интерфейс пользователя

- **Главная страница** (http://localhost:3000) - выбор стола для просмотра
- **Страница стола** (http://localhost:3000/table/{id}) - отображение статистики выбранного стола
- **Панель администратора** (http://localhost:3000/admin) - управление и ввод данных

### Панель администратора

1. Вход с использованием пароля администратора (по умолчанию "admin123")
2. Выбор стола из выпадающего списка
3. Нажатие на кнопку с числом для добавления нового результата (требуется подтверждение)
4. Кнопка "Сбросить данные стола" для обнуления всей статистики и истории выпадений

### API Endpoints

- `GET /api/table/:id` - получение информации о столе
- `GET /api/tables` - получение списка всех столов
- `POST /api/table/:id/add` - добавление нового числа на стол (требует аутентификации)
- `POST /api/table/:id/reset` - сброс стола (требует аутентификации)
- `POST /api/auth` - проверка аутентификации

### WebSocket

Для получения обновлений стола в режиме реального времени используется WebSocket соединение:

1. Подключение к серверу Socket.IO
2. Отправка события `joinTable` с ID стола
3. Прослушивание события `tableUpdate` для получения обновлений 