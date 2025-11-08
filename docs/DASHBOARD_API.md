# 📊 API de Dashboard

Documentación completa de todos los endpoints de dashboard y estadísticas.

## Base URL

```
http://localhost:5000/api/dashboard
```

**Nota:** Todos los endpoints requieren autenticación con Bearer token.

---

## 📋 Endpoints

### 1. Resumen Financiero General

**GET** `/summary`

Obtener un resumen completo de ingresos, gastos y balance del período.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `startDate`: Fecha de inicio (ISO8601) - Default: inicio del mes actual
- `endDate`: Fecha de fin (ISO8601) - Default: fin del mes actual

**Ejemplos:**

```
GET /api/dashboard/summary
GET /api/dashboard/summary?startDate=2024-11-01&endDate=2024-11-30
GET /api/dashboard/summary?startDate=2024-10-01&endDate=2024-10-31
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-11-01",
      "endDate": "2024-11-30"
    },
    "summary": {
      "totalIncome": "45000.00",
      "totalExpenses": "28500.00",
      "balance": "16500.00",
      "savingsRate": 36.67
    },
    "counts": {
      "incomes": 5,
      "expenses": 23,
      "transactions": 28
    }
  }
}
```

**Campos:**

- `totalIncome`: Total de ingresos del período
- `totalExpenses`: Total de gastos del período
- `balance`: Diferencia (ingresos - gastos)
- `savingsRate`: Porcentaje de ahorro (balance / ingresos \* 100)
- `counts`: Cantidad de transacciones

---

### 2. Desglose por Categorías

**GET** `/categories`

Obtener Top 5 de categorías de ingresos y gastos.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `startDate`: Fecha de inicio (ISO8601) - Default: inicio del mes actual
- `endDate`: Fecha de fin (ISO8601) - Default: fin del mes actual

**Ejemplos:**

```
GET /api/dashboard/categories
GET /api/dashboard/categories?startDate=2024-11-01&endDate=2024-11-30
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-11-01",
      "endDate": "2024-11-30"
    },
    "topIncomeCategories": [
      {
        "categoryId": 1,
        "categoryName": "Salario",
        "categoryColor": "#10B981",
        "total": "25000.00",
        "count": 2,
        "percentage": 55.56
      },
      {
        "categoryId": 2,
        "categoryName": "Freelance",
        "categoryColor": "#3B82F6",
        "total": "15000.00",
        "count": 3,
        "percentage": 33.33
      },
      {
        "categoryId": 3,
        "categoryName": "Inversiones",
        "categoryColor": "#8B5CF6",
        "total": "5000.00",
        "count": 1,
        "percentage": 11.11
      }
    ],
    "topExpenseCategories": [
      {
        "categoryId": 5,
        "categoryName": "Alimentación",
        "categoryColor": "#EF4444",
        "total": "8500.00",
        "count": 12,
        "percentage": 29.82
      },
      {
        "categoryId": 7,
        "categoryName": "Vivienda",
        "categoryColor": "#6366F1",
        "total": "8000.00",
        "count": 1,
        "percentage": 28.07
      },
      {
        "categoryId": 6,
        "categoryName": "Transporte",
        "categoryColor": "#F59E0B",
        "total": "5000.00",
        "count": 6,
        "percentage": 17.54
      },
      {
        "categoryId": 8,
        "categoryName": "Entretenimiento",
        "categoryColor": "#EC4899",
        "total": "4000.00",
        "count": 3,
        "percentage": 14.04
      },
      {
        "categoryId": 9,
        "categoryName": "Servicios",
        "categoryColor": "#06B6D4",
        "total": "3000.00",
        "count": 1,
        "percentage": 10.53
      }
    ]
  }
}
```

**Campos:**

- `total`: Total acumulado en esa categoría
- `count`: Número de transacciones
- `percentage`: Porcentaje respecto al total

---

### 3. Tendencias Mensuales

**GET** `/trends`

Obtener tendencias de ingresos y gastos por mes.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `months`: Número de meses hacia atrás (default: 6, máximo: 12)

**Ejemplos:**

```
GET /api/dashboard/trends
GET /api/dashboard/trends?months=12
GET /api/dashboard/trends?months=3
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "monthsCount": 6,
    "trends": [
      {
        "period": "2024-06",
        "month": "Junio",
        "year": 2024,
        "income": "42000.00",
        "expenses": "25000.00",
        "balance": "17000.00",
        "savingsRate": 40.48
      },
      {
        "period": "2024-07",
        "month": "Julio",
        "year": 2024,
        "income": "45000.00",
        "expenses": "28000.00",
        "balance": "17000.00",
        "savingsRate": 37.78
      },
      {
        "period": "2024-08",
        "month": "Agosto",
        "year": 2024,
        "income": "40000.00",
        "expenses": "30000.00",
        "balance": "10000.00",
        "savingsRate": 25.0
      },
      {
        "period": "2024-09",
        "month": "Septiembre",
        "year": 2024,
        "income": "48000.00",
        "expenses": "26000.00",
        "balance": "22000.00",
        "savingsRate": 45.83
      },
      {
        "period": "2024-10",
        "month": "Octubre",
        "year": 2024,
        "income": "45000.00",
        "expenses": "27500.00",
        "balance": "17500.00",
        "savingsRate": 38.89
      },
      {
        "period": "2024-11",
        "month": "Noviembre",
        "year": 2024,
        "income": "45000.00",
        "expenses": "28500.00",
        "balance": "16500.00",
        "savingsRate": 36.67
      }
    ]
  }
}
```

**Uso:** Perfecto para gráficas de líneas mostrando evolución temporal.

---

### 4. Comparación de Períodos

**GET** `/comparison`

Comparar dos períodos diferentes (ej: mes actual vs mes anterior).

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (todos requeridos):**

- `period1Start`: Fecha inicio período 1 (ISO8601)
- `period1End`: Fecha fin período 1 (ISO8601)
- `period2Start`: Fecha inicio período 2 (ISO8601)
- `period2End`: Fecha fin período 2 (ISO8601)

**Ejemplos:**

```
# Comparar noviembre vs octubre 2024
GET /api/dashboard/comparison?period1Start=2024-10-01&period1End=2024-10-31&period2Start=2024-11-01&period2End=2024-11-30

# Comparar primer vs segundo semestre 2024
GET /api/dashboard/comparison?period1Start=2024-01-01&period1End=2024-06-30&period2Start=2024-07-01&period2End=2024-12-31
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "period1": {
      "startDate": "2024-10-01",
      "endDate": "2024-10-31",
      "income": "45000.00",
      "expenses": "27500.00",
      "balance": "17500.00",
      "transactions": 25
    },
    "period2": {
      "startDate": "2024-11-01",
      "endDate": "2024-11-30",
      "income": "45000.00",
      "expenses": "28500.00",
      "balance": "16500.00",
      "transactions": 28
    },
    "changes": {
      "income": 0.0,
      "expenses": 3.64,
      "balance": -5.71
    }
  }
}
```

**Campos de `changes`:**

- Valores positivos: Aumentó respecto al período 1
- Valores negativos: Disminuyó respecto al período 1
- Ejemplo: `expenses: 3.64` significa 3.64% más gastos en período 2

---

### 5. Transacciones Recientes

**GET** `/recent`

Obtener las transacciones más recientes (combinadas de ingresos y gastos).

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `limit`: Cantidad de transacciones (default: 10, máximo: 50)

**Ejemplos:**

```
GET /api/dashboard/recent
GET /api/dashboard/recent?limit=20
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "type": "expense",
      "description": "Compra en supermercado",
      "amount": "1500.00",
      "date": "2024-11-08T00:00:00.000Z",
      "category": {
        "id": 5,
        "name": "Alimentación",
        "color": "#EF4444",
        "type": "expense"
      },
      "paymentMethod": "card",
      "createdAt": "2024-11-08T14:30:00.000Z"
    },
    {
      "id": 8,
      "type": "income",
      "description": "Proyecto freelance",
      "amount": "8000.00",
      "date": "2024-11-05T00:00:00.000Z",
      "category": {
        "id": 2,
        "name": "Freelance",
        "color": "#3B82F6",
        "type": "income"
      },
      "createdAt": "2024-11-05T10:00:00.000Z"
    },
    {
      "id": 14,
      "type": "expense",
      "description": "Gasolina",
      "amount": "800.00",
      "date": "2024-11-04T00:00:00.000Z",
      "category": {
        "id": 6,
        "name": "Transporte",
        "color": "#F59E0B",
        "type": "expense"
      },
      "paymentMethod": "cash",
      "createdAt": "2024-11-04T18:20:00.000Z"
    }
  ]
}
```

**Campos:**

- `type`: "income" o "expense"
- Gastos incluyen `paymentMethod`
- Ordenados por fecha descendente

---

## 📊 Casos de Uso

### Dashboard Principal

```bash
# 1. Resumen del mes actual
GET /api/dashboard/summary

# 2. Top categorías del mes
GET /api/dashboard/categories

# 3. Últimas 10 transacciones
GET /api/dashboard/recent?limit=10
```

### Análisis de Tendencias

```bash
# Ver evolución de últimos 6 meses
GET /api/dashboard/trends?months=6

# Ver evolución anual
GET /api/dashboard/trends?months=12
```

### Comparativas

```bash
# Comparar este mes vs mes anterior
GET /api/dashboard/comparison?period1Start=2024-10-01&period1End=2024-10-31&period2Start=2024-11-01&period2End=2024-11-30

# Comparar este año vs año anterior
GET /api/dashboard/comparison?period1Start=2023-01-01&period1End=2023-12-31&period2Start=2024-01-01&period2End=2024-12-31
```

### Dashboard por Período Personalizado

```bash
# Resumen y categorías de un trimestre específico
GET /api/dashboard/summary?startDate=2024-07-01&endDate=2024-09-30
GET /api/dashboard/categories?startDate=2024-07-01&endDate=2024-09-30
```

---

## 🧪 Testing con cURL

### Resumen del mes actual

```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Top categorías de noviembre

```bash
curl -X GET "http://localhost:5000/api/dashboard/categories?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Tendencias de 6 meses

```bash
curl -X GET "http://localhost:5000/api/dashboard/trends?months=6" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Comparar octubre vs noviembre

```bash
curl -X GET "http://localhost:5000/api/dashboard/comparison?period1Start=2024-10-01&period1End=2024-10-31&period2Start=2024-11-01&period2End=2024-11-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Últimas 20 transacciones

```bash
curl -X GET "http://localhost:5000/api/dashboard/recent?limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📈 Métricas Clave

### Savings Rate (Tasa de Ahorro)

```
Savings Rate = (Balance / Total Income) * 100

Ejemplo:
Ingresos: $45,000
Gastos: $28,500
Balance: $16,500
Savings Rate: (16,500 / 45,000) * 100 = 36.67%
```

**Interpretación:**

- < 10%: Ahorro muy bajo
- 10-20%: Ahorro moderado
- 20-30%: Buen ahorro
- 30%+: Excelente ahorro

### Porcentaje de Cambio

```
Change % = ((Period2 - Period1) / Period1) * 100

Ejemplo:
Period1 Expenses: $27,500
Period2 Expenses: $28,500
Change: ((28,500 - 27,500) / 27,500) * 100 = 3.64%
```

---

## 💡 Mejores Prácticas

1. **Default al mes actual:** Si no se especifican fechas, usar mes actual para relevancia
2. **Tendencias limitadas:** Máximo 12 meses para mantener performance
3. **Caché:** Considerar cachear resúmenes para períodos cerrados
4. **Comparaciones útiles:**
   - Mes actual vs mes anterior
   - Trimestre actual vs trimestre anterior
   - Año actual vs año anterior
5. **Transacciones recientes:** Útil para verificar últimos movimientos

---

## 🎨 Sugerencias de Visualización

### Resumen

- Tarjetas con iconos para Total Income, Total Expenses, Balance
- Color verde para balance positivo, rojo para negativo
- Indicador de Savings Rate con barra de progreso

### Categorías

- Gráfica de pastel (pie chart) o donut chart
- Usar los colores definidos en cada categoría
- Top 5 para mantener legibilidad

### Tendencias

- Gráfica de líneas (line chart) con dos líneas:
  - Ingresos (verde/azul)
  - Gastos (rojo/naranja)
- Mostrar balance como área rellena entre líneas

### Comparación

- Barras lado a lado (grouped bar chart)
- Mostrar porcentaje de cambio con flechas ↑ ↓

### Transacciones Recientes

- Lista con avatares de categoría
- Badge para tipo (income/expense)
- Colores según tipo de transacción

---

## 📊 Códigos de Estado

| Código | Significado                                    |
| ------ | ---------------------------------------------- |
| 200    | OK - Solicitud exitosa                         |
| 400    | Bad Request - Parámetros faltantes o inválidos |
| 401    | Unauthorized - Token inválido                  |
| 422    | Unprocessable Entity - Error de validación     |
| 500    | Internal Server Error - Error del servidor     |

---

## 🔍 Análisis Avanzados

### Identificar Patrones de Gasto

```bash
# Ver tendencias para detectar meses con gastos altos
GET /api/dashboard/trends?months=12

# Ver qué categorías consumen más
GET /api/dashboard/categories
```

### Evaluar Salud Financiera

```bash
# Calcular savings rate
GET /api/dashboard/summary

# Comparar con períodos anteriores
GET /api/dashboard/comparison
```

### Monitoreo Continuo

```bash
# Dashboard diario: últimas transacciones
GET /api/dashboard/recent?limit=5

# Resumen semanal
GET /api/dashboard/summary?startDate=2024-11-01&endDate=2024-11-07
```
