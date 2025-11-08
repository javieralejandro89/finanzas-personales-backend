import { dinero, add, subtract, multiply, toDecimal, toSnapshot, Dinero } from 'dinero.js';
import { MXN, USD, EUR } from '@dinero.js/currencies';

/**
 * Mapeo de códigos de moneda a objetos de moneda de dinero.js
 */
const currencyMap = {
  MXN,
  USD,
  EUR,
};

export type SupportedCurrency = keyof typeof currencyMap;

/**
 * Crear un objeto Dinero desde un número o string
 * @param amount Cantidad en formato decimal (ej: 123.45)
 * @param currencyCode Código de moneda ISO (MXN, USD, EUR)
 * @returns Objeto Dinero
 */
export const createMoney = (
  amount: number | string,
  currencyCode: SupportedCurrency = 'MXN'
): Dinero<number> => {
  const currency = currencyMap[currencyCode];
  
  if (!currency) {
    throw new Error(`Moneda no soportada: ${currencyCode}`);
  }

  // Convertir a número si viene como string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    throw new Error(`Cantidad inválida: ${amount}`);
  }

  // Convertir a centavos (scale = 2 para MXN, USD, EUR)
  const amountInCents = Math.round(numericAmount * Math.pow(10, currency.exponent));

  return dinero({ amount: amountInCents, currency });
};

/**
 * Sumar dos cantidades monetarias
 * @param a Primera cantidad
 * @param b Segunda cantidad
 * @returns Suma de ambas cantidades
 */
export const addMoney = (a: Dinero<number>, b: Dinero<number>): Dinero<number> => {
  return add(a, b);
};

/**
 * Restar dos cantidades monetarias
 * @param a Cantidad base
 * @param b Cantidad a restar
 * @returns Diferencia de ambas cantidades
 */
export const subtractMoney = (a: Dinero<number>, b: Dinero<number>): Dinero<number> => {
  return subtract(a, b);
};

/**
 * Multiplicar una cantidad monetaria por un factor
 * @param amount Cantidad monetaria
 * @param multiplier Factor de multiplicación
 * @returns Resultado de la multiplicación
 */
export const multiplyMoney = (
  amount: Dinero<number>,
  multiplier: number
): Dinero<number> => {
  return multiply(amount, { amount: multiplier, scale: 0 });
};

/**
 * Dividir una cantidad monetaria por un divisor
 * @param amount Cantidad monetaria
 * @param divisor Factor de división
 * @returns Resultado de la división
 */
export const divideMoney = (
  amount: Dinero<number>,
  divisor: number
): Dinero<number> => {
  return multiply(amount, { amount: 1 / divisor, scale: 2 });
};

/**
 * Convertir objeto Dinero a string decimal
 * @param amount Objeto Dinero
 * @returns String en formato decimal (ej: "123.45")
 */
export const moneyToDecimal = (amount: Dinero<number>): string => {
  return toDecimal(amount);
};

/**
 * Convertir objeto Dinero a número
 * @param amount Objeto Dinero
 * @returns Número en formato decimal
 */
export const moneyToNumber = (amount: Dinero<number>): number => {
  return parseFloat(toDecimal(amount));
};

/**
 * Formatear cantidad monetaria para mostrar
 * @param amount Objeto Dinero o número/string
 * @param currencyCode Código de moneda
 * @returns String formateado (ej: "$1,234.56 MXN")
 */
export const formatMoney = (
  amount: Dinero<number> | number | string,
  currencyCode: SupportedCurrency = 'MXN'
): string => {
  let dineroAmount: Dinero<number>;

  if (typeof amount === 'number' || typeof amount === 'string') {
    dineroAmount = createMoney(amount, currencyCode);
  } else {
    dineroAmount = amount;
  }

  const decimal = toDecimal(dineroAmount);
  const [integerPart, decimalPart = '00'] = decimal.split('.');
  
  // Formatear con comas para miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `$${formattedInteger}.${decimalPart.padEnd(2, '0')} ${currencyCode}`;
};

/**
 * Sumar un array de cantidades monetarias
 * @param amounts Array de objetos Dinero
 * @returns Suma total
 */
export const sumMoney = (amounts: Dinero<number>[]): Dinero<number> => {
  if (amounts.length === 0) {
    return createMoney(0);
  }

  return amounts.reduce((acc, curr) => add(acc, curr));
};

/**
 * Calcular porcentaje de una cantidad respecto a un total
 * @param amount Cantidad a calcular
 * @param total Total de referencia
 * @returns Porcentaje (0-100)
 */
export const calculatePercentage = (
  amount: Dinero<number>,
  total: Dinero<number>
): number => {
  const amountNum = moneyToNumber(amount);
  const totalNum = moneyToNumber(total);

  if (totalNum === 0) return 0;

  return (amountNum / totalNum) * 100;
};

/**
 * Validar que una cantidad sea positiva
 * @param amount Cantidad a validar
 * @returns true si es positiva
 */
export const isPositive = (amount: Dinero<number>): boolean => {
  return moneyToNumber(amount) > 0;
};

/**
 * Validar que una cantidad sea negativa
 * @param amount Cantidad a validar
 * @returns true si es negativa
 */
export const isNegative = (amount: Dinero<number>): boolean => {
  return moneyToNumber(amount) < 0;
};

/**
 * Validar que una cantidad sea cero
 * @param amount Cantidad a validar
 * @returns true si es cero
 */
export const isZero = (amount: Dinero<number>): boolean => {
  return moneyToNumber(amount) === 0;
};

/**
 * Comparar si dos cantidades son iguales
 * @param a Primera cantidad
 * @param b Segunda cantidad
 * @returns true si son iguales
 */
export const isEqual = (a: Dinero<number>, b: Dinero<number>): boolean => {
  return moneyToDecimal(a) === moneyToDecimal(b);
};

/**
 * Obtener el valor absoluto de una cantidad
 * @param amount Cantidad monetaria
 * @returns Valor absoluto
 */
export const absoluteMoney = (amount: Dinero<number>): Dinero<number> => {
  const value = moneyToNumber(amount);
  const snapshot = toSnapshot(amount);
  return createMoney(Math.abs(value), snapshot.currency.code as SupportedCurrency);
};