import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import tableRoutes from './routes/tableRoutes';
import { initDatabase, initDefaultTables } from './services/tableService';
import { initSocketServer } from './socket/socketManager';

// Загрузка переменных окружения
dotenv.config();

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3000;

// Базовый путь для приложения (поддиректория)
const BASE_PATH = '/roulette';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
app.use(`${BASE_PATH}/api`, tableRoutes);

// Статические файлы для админ-панели и клиента
app.use(`${BASE_PATH}`, express.static(path.join(__dirname, '../public')));
// Добавляем доступ к папке media
app.use(`${BASE_PATH}/media`, express.static(path.join(__dirname, '../media')));

// Маршруты для HTML-страниц
app.get(`${BASE_PATH}/admin`, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get(`${BASE_PATH}/table/:id`, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/table.html'));
});

app.get(`${BASE_PATH}`, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Перенаправление с корня на базовый путь
app.get('/', (req, res) => {
  res.redirect(BASE_PATH);
});

// Создание HTTP сервера
const server = http.createServer(app);

// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    // Подключение к базе данных
    await initDatabase();
    
    // Инициализация столов по умолчанию
    await initDefaultTables();
    
    // Инициализация Socket.IO с базовым путем
    initSocketServer(server, BASE_PATH);
    
    // Запуск сервера
    server.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Приложение доступно по адресу: http://localhost:${PORT}${BASE_PATH}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Экспорт базового пути для использования в других модулях
export const basePath = BASE_PATH;

// Запуск приложения
startServer(); 