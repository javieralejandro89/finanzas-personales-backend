import { Request, Response, NextFunction } from 'express';
import { Dinero } from 'dinero.js';

/**
 * Tipos extendidos de Express
 */

// Usuario autenticado en el request
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    currency: string;
  };
}

/**
 * DTOs de Autenticación
 */

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * DTOs de Categorías
 */

export interface CreateCategoryDTO {
  name: string;
  type: 'income' | 'expense';
  color?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  isActive?: boolean;
}

/**
 * DTOs de Ingresos
 */

export interface CreateIncomeDTO {
  concept: string;
  amount: number | string;
  date: string | Date;
  description?: string;
  categoryId: number;
}

export interface UpdateIncomeDTO {
  concept?: string;
  amount?: number | string;
  date?: string | Date;
  description?: string;
  categoryId?: number;
}

/**
 * DTOs de Gastos
 */

export interface CreateExpenseDTO {
  description: string;
  amount: number | string;
  date: string | Date;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  categoryId: number;
}

export interface UpdateExpenseDTO {
  description?: string;
  amount?: number | string;
  date?: string | Date;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  categoryId?: number;
}

/**
 * Tipos de respuesta API
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Tipos de JWT
 */

export interface JWTAccessPayload {
  userId: number;
  email: string;
  type: 'access';
}

export interface JWTRefreshPayload {
  userId: number;
  sessionId: string;
  type: 'refresh';
}

/**
 * Tipos de sesión
 */

export interface SessionData {
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Tipos de Money (dinero.js)
 */

export interface MoneyAmount {
  amount: number;
  currency: string;
}

export type DineroObject = Dinero<number>;

/**
 * Tipos de filtros para queries
 */

export interface DateRangeFilter {
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface IncomeFilters extends DateRangeFilter {
  categoryId?: number;
  page?: number;
  limit?: number;
}

export interface ExpenseFilters extends DateRangeFilter {
  categoryId?: number;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

/**
 * Tipos de estadísticas
 */

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: string;
  count: number;
  percentage: number;
}

export interface FinancialSummary {
  totalIncome: string;
  totalExpenses: string;
  balance: string;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface DashboardStats {
  summary: FinancialSummary;
  topIncomeCategories: CategorySummary[];
  topExpenseCategories: CategorySummary[];
  monthlyTrend: MonthlyTrendData[];
}

export interface MonthlyTrendData {
  month: string;
  year: number;
  income: string;
  expenses: string;
  balance: string;
}

/**
 * Tipos de errores personalizados
 */

export interface CustomError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Tipos de middleware
 */

export type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Enums
 */

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  CHECK = 'check',
  OTHER = 'other',
}

/**
 * Tipos de utilidad
 */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = number;