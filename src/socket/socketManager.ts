import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { Table } from '../types';

let io: SocketServer;

// Инициализация Socket.IO сервера
export function initSocketServer(httpServer: HttpServer): void {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Новое соединение: ${socket.id}`);

    // Присоединение к комнате стола
    socket.on('joinTable', (tableId: string) => {
      socket.join(`table-${tableId}`);
      console.log(`Клиент ${socket.id} присоединился к столу ${tableId}`);
    });

    // Отсоединение от комнаты стола
    socket.on('leaveTable', (tableId: string) => {
      socket.leave(`table-${tableId}`);
      console.log(`Клиент ${socket.id} покинул стол ${tableId}`);
    });

    // Обработка отключения
    socket.on('disconnect', () => {
      console.log(`Соединение разорвано: ${socket.id}`);
    });
  });

  console.log('Socket.IO сервер инициализирован');
}

// Отправка обновлений стола всем подключенным клиентам
export function emitTableUpdate(table: Table): void {
  if (!io) {
    console.error('Socket.IO сервер не инициализирован');
    return;
  }

  io.to(`table-${table.tableId}`).emit('tableUpdate', table);
} 