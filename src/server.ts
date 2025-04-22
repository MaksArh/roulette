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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API маршруты
app.use('/api', tableRoutes);

// Статические файлы для админ-панели и клиента
app.use(express.static(path.join(__dirname, '../public')));
// Добавляем доступ к папке media
app.use('/media', express.static(path.join(__dirname, '../media')));

// Маршруты для HTML-страниц
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/table/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/table.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
    
    // Инициализация Socket.IO
    initSocketServer(server);
    
    // Запуск сервера
    server.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

// Запуск приложения
startServer(); 