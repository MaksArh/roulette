import { Table, RouletteNumber } from '../types';
import { 
  DEFAULT_MIN_BET, 
  DEFAULT_MAX_BET, 
  MAX_HISTORY_LENGTH, 
  DISPLAY_HISTORY_LENGTH 
} from '../config/constants';
import { calculateStatistics, getNumberColor } from '../utils/rouletteHelpers';
import { MongoClient, Db, Collection } from 'mongodb';
import { emitTableUpdate } from '../socket/socketManager';

// MongoDB клиент
let client: MongoClient;
let db: Db;
let tablesCollection: Collection<Table>;

// Инициализация подключения к MongoDB
export async function initDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/roulette';
  client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Подключено к MongoDB');
    db = client.db();
    tablesCollection = db.collection<Table>('tables');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

// Получение стола по ID (создание, если не существует)
export async function getTable(tableId: string): Promise<Table> {
  const table = await tablesCollection.findOne({ tableId });

  if (table) {
    return table;
  }

  // Создание нового стола
  const newTable: Table = {
    tableId,
    lastNumbers: [],
    allNumbers: [],
    minBet: DEFAULT_MIN_BET,
    maxBet: DEFAULT_MAX_BET,
    statistics: {
      lowMidHigh: { low: 0, zero: 0, high: 0 },
      evenOddZero: { even: 0, zero: 0, odd: 0 },
      colorDistribution: { black: 0, green: 0, red: 0 },
      hotNumbers: [],
      coldNumbers: []
    }
  };

  await tablesCollection.insertOne(newTable);
  return newTable;
}

// Добавление нового числа на стол
export async function addNumberToTable(tableId: string, value: number): Promise<Table> {
  const color = getNumberColor(value);
  const newNumber: RouletteNumber = { value, color };

  const table = await getTable(tableId);
  
  // Добавление нового числа в начало истории
  const newAllNumbers = [newNumber, ...table.allNumbers];
  
  // Ограничение длины истории
  if (newAllNumbers.length > MAX_HISTORY_LENGTH) {
    newAllNumbers.splice(MAX_HISTORY_LENGTH);
  }
  
  // Обновление последних чисел для отображения
  const newLastNumbers = newAllNumbers.slice(0, DISPLAY_HISTORY_LENGTH);
  
  // Расчет новых статистик
  const statistics = calculateStatistics(newAllNumbers);
  
  // Обновление стола в базе данных
  const updatedTable: Table = {
    ...table,
    lastNumbers: newLastNumbers,
    allNumbers: newAllNumbers,
    statistics
  };
  
  await tablesCollection.updateOne(
    { tableId },
    { $set: updatedTable }
  );
  
  // Отправка обновления через WebSocket
  emitTableUpdate(updatedTable);
  
  return updatedTable;
}

// Сброс стола (обнуление всех данных)
export async function resetTable(tableId: string): Promise<Table> {
  const table = await getTable(tableId);
  
  const resetTable: Table = {
    ...table,
    lastNumbers: [],
    allNumbers: [],
    statistics: {
      lowMidHigh: { low: 0, zero: 0, high: 0 },
      evenOddZero: { even: 0, zero: 0, odd: 0 },
      colorDistribution: { black: 0, green: 0, red: 0 },
      hotNumbers: [],
      coldNumbers: []
    }
  };
  
  await tablesCollection.updateOne(
    { tableId },
    { $set: resetTable }
  );
  
  // Отправка обновления через WebSocket
  emitTableUpdate(resetTable);
  
  return resetTable;
}

// Получение списка всех столов
export async function getAllTables(): Promise<Table[]> {
  return tablesCollection.find().toArray();
}

// Инициализация столов по умолчанию
export async function initDefaultTables() {
  const tableCount = await tablesCollection.countDocuments();
  
  // Если столов меньше 30, создаем недостающие
  if (tableCount < 30) {
    console.log(`Создание столов по умолчанию (существует ${tableCount} из 30)...`);
    
    for (let i = 1; i <= 30; i++) {
      const tableId = i.toString();
      const existingTable = await tablesCollection.findOne({ tableId });
      
      if (!existingTable) {
        await getTable(tableId);
        console.log(`Создан стол ${tableId}`);
      }
    }
  }
} 