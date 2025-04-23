import express from 'express';
import { getTable, addNumberToTable, resetTable, getAllTables, revertLastNumber } from '../services/tableService';
import { authenticateAdmin } from '../middleware/auth';

const router = express.Router();

// Получение информации о столе
router.get('/table/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const table = await getTable(id);
    res.json(table);
  } catch (error) {
    console.error('Ошибка при получении стола:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка всех столов
router.get('/tables', async (req, res) => {
  try {
    const tables = await getAllTables();
    res.json(tables);
  } catch (error) {
    console.error('Ошибка при получении списка столов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление числа на стол (требуется аутентификация)
router.post('/table/:id/add', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    
    if (value === undefined || value < 0 || value > 36 || !Number.isInteger(value)) {
      return res.status(400).json({ error: 'Некорректное значение числа. Допустимы целые числа от 0 до 36.' });
    }
    
    const updatedTable = await addNumberToTable(id, value);
    res.json(updatedTable);
  } catch (error) {
    console.error('Ошибка при добавлении числа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Сброс стола (требуется аутентификация)
router.post('/table/:id/reset', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const resetData = await resetTable(id);
    res.json(resetData);
  } catch (error) {
    console.error('Ошибка при сбросе стола:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отмена последнего добавленного числа (требуется аутентификация)
router.post('/table/:id/revert', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTable = await revertLastNumber(id);
    res.json(updatedTable);
  } catch (error) {
    console.error('Ошибка при отмене последнего числа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Проверка аутентификации
router.post('/auth', authenticateAdmin, (req, res) => {
  res.json({ success: true });
});

export default router; 