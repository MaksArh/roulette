import { RouletteNumber, TableStatistics } from '../types';
import { HOT_COLD_NUMBERS_COUNT } from '../config/constants';

// Получение цвета числа
export function getNumberColor(value: number): 'red' | 'black' | 'green' {
  if (value === 0) return 'green';
  
  // Числа, которые должны быть красными
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  return redNumbers.includes(value) ? 'red' : 'black';
}

// Расчет статистики на основе истории выпадений
export function calculateStatistics(allNumbers: RouletteNumber[]): TableStatistics {
  // Счетчики для каждого числа от 0 до 36
  const numberCounts: { [key: number]: number } = {};
  for (let i = 0; i <= 36; i++) {
    numberCounts[i] = 0;
  }

  // Счетчики для категорий
  let low = 0;
  let high = 0;
  let zero = 0;
  let even = 0;
  let odd = 0;
  let red = 0;
  let black = 0;
  let green = 0;

  // Подсчет выпадений
  allNumbers.forEach(num => {
    const value = num.value;
    numberCounts[value]++;

    if (value === 0) {
      // Зеро отдельно считается для всех категорий
      zero++;
      green++;
    } else if (value >= 1 && value <= 18) {
      // Низкие числа (1-18)
      low++;
      if (value % 2 === 0) {
        even++;
      } else {
        odd++;
      }
      if (num.color === 'red') {
        red++;
      } else {
        black++;
      }
    } else if (value >= 19 && value <= 36) {
      // Высокие числа (19-36)
      high++;
      if (value % 2 === 0) {
        even++;
      } else {
        odd++;
      }
      if (num.color === 'red') {
        red++;
      } else {
        black++;
      }
    }
  });

  // Подготовка горячих и холодных чисел
  const numbersWithCounts = Object.entries(numberCounts).map(([num, count]) => ({
    value: parseInt(num),
    count
  }));

  // Сортировка по убыванию (горячие) и возрастанию (холодные)
  const hotNumbers = [...numbersWithCounts].sort((a, b) => b.count - a.count).slice(0, HOT_COLD_NUMBERS_COUNT);
  const coldNumbers = [...numbersWithCounts].sort((a, b) => a.count - b.count).slice(0, HOT_COLD_NUMBERS_COUNT);

  return {
    lowMidHigh: {
      low,
      zero,
      high
    },
    evenOddZero: {
      even,
      zero,
      odd
    },
    colorDistribution: {
      black,
      green,
      red
    },
    hotNumbers,
    coldNumbers
  };
} 