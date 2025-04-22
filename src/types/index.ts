export interface RouletteNumber {
  value: number;
  color: 'red' | 'black' | 'green';
}

export interface Table {
  tableId: string;
  lastNumbers: RouletteNumber[];
  allNumbers: RouletteNumber[];
  minBet: number;
  maxBet: number;
  statistics: TableStatistics;
}

export interface TableStatistics {
  lowMidHigh: {
    low: number;
    zero: number;
    high: number;
  };
  evenOddZero: {
    even: number;
    zero: number;
    odd: number;
  };
  colorDistribution: {
    black: number;
    green: number;
    red: number;
  };
  hotNumbers: Array<{ value: number; count: number }>;
  coldNumbers: Array<{ value: number; count: number }>;
}

export interface AuthData {
  password: string;
} 