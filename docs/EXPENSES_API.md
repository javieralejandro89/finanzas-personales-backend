# 💸 API de Gastos

Documentación completa de todos los endpoints de gastos.

## Base URL

```
http://localhost:5000/api/expenses
```

**Nota:** Todos los endpoints requieren autenticación con Bearer token.

---

## 📋 Endpoints

### 1. Crear Gasto

**POST** `/`

Registrar un nuevo gasto.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "description": "Compra en supermercado",
  "amount": 1500,
  "date": "2024-11-08",
  "notes": "Despensa semanal",
  "paymentMethod": "card",
  "categoryId": 3
}
```

**Validaciones:**

- `description`: 3-255 caracteres, requerido
- `amount`: Número mayor a 0, requerido (máximo: 999,999,999.99)
- `date`: Fecha en formato ISO8601, requerida
- `notes`: Opcional, máximo 1000 caracteres
- `paymentMethod`: Opcional (cash, card, transfer, check, other), default: cash
- `categoryId`: ID de categoría existente de tipo "expense", requerido

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Gasto creado exitosamente",
  "data": {
    "id": 1,
    "description": "Compra en supermercado",
    "amount": "1500.00",
    "date": "2024-11-08T00:00:00.000Z",
    "notes": "Despensa semanal",
    "paymentMethod": "card",
    "userId": 1,
    "categoryId": 3,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z",
    "category": {
      "id": 3,
      "name": "Alimentación",
      "color": "#EF4444",
      "type": "expense"
    }
  }
}
```

**Errores:**

- `404`: Categoría no encontrada
- `400`: La categoría debe ser de tipo gasto
- `400`: La categoría está inactiva
- `400`: El monto debe ser mayor a cero

---

### 2. Listar Gastos

**GET** `/`

Obtener todos los gastos del usuario con paginación y filtros.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (todos opcionales):**

- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 20, máximo: 100)
- `categoryId`: Filtrar por categoría
- `paymentMethod`: Filtrar por método de pago
- `startDate`: Fecha de inicio (ISO8601)
- `endDate`: Fecha de fin (ISO8601)

**Ejemplos:**

```
GET /api/expenses
GET /api/expenses?page=1&limit=10
GET /api/expenses?categoryId=3
GET /api/expenses?paymentMethod=card
GET /api/expenses?startDate=2024-11-01&endDate=2024-11-30
GET /api/expenses?page=2&limit=20&categoryId=3&paymentMethod=card
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "description": "Compra en supermercado",
      "amount": "1500.00",
      "date": "2024-11-08T00:00:00.000Z",
      "notes": "Despensa semanal",
      "paymentMethod": "card",
      "userId": 1,
      "categoryId": 3,
      "createdAt": "2024-11-08T10:30:00.000Z",
      "updatedAt": "2024-11-08T10:30:00.000Z",
      "category": {
        "id": 3,
        "name": "Alimentación",
        "color": "#EF4444",
        "type": "expense"
      }
    },
    {
      "id": 2,
      "description": "Gasolina",
      "amount": "800.00",
      "date": "2024-11-07T00:00:00.000Z",
      "notes": null,
      "paymentMethod": "cash",
      "userId": 1,
      "categoryId": 4,
      "createdAt": "2024-11-08T11:00:00.000Z",
      "updatedAt": "2024-11-08T11:00:00.000Z",
      "category": {
        "id": 4,
        "name": "Transporte",
        "color": "#F59E0B",
        "type": "expense"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Gasto por ID

**GET** `/:id`

Obtener detalles de un gasto específico.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID del gasto (entero)

**Ejemplo:**

```
GET /api/expenses/1
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "description": "Compra en supermercado",
    "amount": "1500.00",
    "date": "2024-11-08T00:00:00.000Z",
    "notes": "Despensa semanal",
    "paymentMethod": "card",
    "userId": 1,
    "categoryId": 3,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z",
    "category": {
      "id": 3,
      "name": "Alimentación",
      "color": "#EF4444",
      "type": "expense"
    }
  }
}
```

**Errores:**

- `404`: Gasto no encontrado o no pertenece al usuario

---

### 4. Actualizar Gasto

**PATCH** `/:id`

Actualizar información de un gasto.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID del gasto

**Body (todos los campos son opcionales):**

```json
{
  "description": "Compra en Walmart",
  "amount": 1650,
  "date": "2024-11-08",
  "notes": "Despensa semanal + productos de limpieza",
  "paymentMethod": "card",
  "categoryId": 3
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Gasto actualizado exitosamente",
  "data": {
    "id": 1,
    "description": "Compra en Walmart",
    "amount": "1650.00",
    "date": "2024-11-08T00:00:00.000Z",
    "notes": "Despensa semanal + productos de limpieza",
    "paymentMethod": "card",
    "userId": 1,
    "categoryId": 3,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T12:00:00.000Z",
    "category": {
      "id": 3,
      "name": "Alimentación",
      "color": "#EF4444",
      "type": "expense"
    }
  }
}
```

**Errores:**

- `404`: Gasto no encontrado
- `404`: Categoría no encontrada
- `400`: La categoría debe ser de tipo gasto
- `400`: El monto debe ser mayor a cero

---

### 5. Eliminar Gasto

**DELETE** `/:id`

Eliminar un gasto permanentemente.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID del gasto

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Gasto eliminado exitosamente"
}
```

**Errores:**

- `404`: Gasto no encontrado

---

### 6. Resumen de Gastos

**GET** `/summary`

Obtener estadísticas y resumen de gastos.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `startDate`: Fecha de inicio (ISO8601)
- `endDate`: Fecha de fin (ISO8601)

**Ejemplos:**

```
GET /api/expenses/summary
GET /api/expenses/summary?startDate=2024-11-01&endDate=2024-11-30
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "total": "15750.00",
    "count": 12,
    "average": "1312.50",
    "highest": {
      "id": 5,
      "description": "Pago de renta",
      "amount": "8000.00",
      "date": "2024-11-01T00:00:00.000Z",
      "notes": "Renta mensual",
      "paymentMethod": "transfer",
      "userId": 1,
      "categoryId": 7,
      "createdAt": "2024-11-08T10:00:00.000Z",
      "updatedAt": "2024-11-08T10:00:00.000Z",
      "category": {
        "id": 7,
        "name": "Vivienda",
        "color": "#6366F1"
      }
    },
    "lowest": {
      "id": 8,
      "description": "Café",
      "amount": "45.00",
      "date": "2024-11-05T00:00:00.000Z",
      "notes": null,
      "paymentMethod": "cash",
      "userId": 1,
      "categoryId": 3,
      "createdAt": "2024-11-08T12:00:00.000Z",
      "updatedAt": "2024-11-08T12:00:00.000Z",
      "category": {
        "id": 3,
        "name": "Alimentación",
        "color": "#EF4444"
      }
    },
    "byPaymentMethod": [
      {
        "paymentMethod": "cash",
        "total": "2500.00",
        "count": 5
      },
      {
        "paymentMethod": "card",
        "total": "8250.00",
        "count": 6
      },
      {
        "paymentMethod": "transfer",
        "total": "5000.00",
        "count": 1
      }
    ],
    "period": {
      "startDate": "2024-11-01",
      "endDate": "2024-11-30"
    }
  }
}
```

---

## 💳 Métodos de Pago

| Valor      | Descripción              |
| ---------- | ------------------------ |
| `cash`     | Efectivo                 |
| `card`     | Tarjeta (débito/crédito) |
| `transfer` | Transferencia bancaria   |
| `check`    | Cheque                   |
| `other`    | Otro método              |

**Default:** Si no se especifica, se usa `cash`.

---

## 💡 Características Especiales

### Precisión Decimal con dinero.js

Al igual que los ingresos, todos los montos se manejan con **dinero.js** para evitar errores de punto flotante.

### Paginación

- **Default:** 20 registros por página
- **Máximo:** 100 registros por página
- **Ordenamiento:** Por fecha descendente (más recientes primero)

### Validación de Categorías

- Solo se pueden asignar categorías de tipo "expense"
- La categoría debe estar activa
- La categoría debe pertenecer al usuario

### Filtros Múltiples

Puedes combinar múltiples filtros en una sola consulta:

```
GET /api/expenses?categoryId=3&paymentMethod=card&startDate=2024-11-01&endDate=2024-11-30&page=1&limit=20
```

---

## 🧪 Testing con cURL

### Crear gasto

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Compra en supermercado",
    "amount": 1500,
    "date": "2024-11-08",
    "notes": "Despensa semanal",
    "paymentMethod": "card",
    "categoryId": 3
  }'
```

### Listar gastos

```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Listar con filtros

```bash
curl -X GET "http://localhost:5000/api/expenses?categoryId=3&paymentMethod=card&startDate=2024-11-01" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Obtener resumen

```bash
curl -X GET "http://localhost:5000/api/expenses/summary?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Actualizar gasto

```bash
curl -X PATCH http://localhost:5000/api/expenses/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1650,
    "notes": "Despensa + productos de limpieza"
  }'
```

### Eliminar gasto

```bash
curl -X DELETE http://localhost:5000/api/expenses/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Códigos de Estado

| Código | Significado                                 |
| ------ | ------------------------------------------- |
| 200    | OK - Solicitud exitosa                      |
| 201    | Created - Gasto creado                      |
| 400    | Bad Request - Datos inválidos               |
| 401    | Unauthorized - Token inválido               |
| 404    | Not Found - Gasto o categoría no encontrada |
| 422    | Unprocessable Entity - Error de validación  |
| 500    | Internal Server Error - Error del servidor  |

---

## 💡 Mejores Prácticas

1. **Descripción clara:** Incluir el lugar/concepto del gasto
2. **Notas útiles:** Agregar contexto cuando sea necesario
3. **Método de pago correcto:** Facilita el seguimiento de gastos por método
4. **Categorización apropiada:** Usar la categoría más específica
5. **Fechas reales:** Registrar la fecha real del gasto, no cuando se registra

---

## 🔍 Casos de Uso

### Registrar compra en supermercado

```json
{
  "description": "Compra en Walmart",
  "amount": 1500,
  "date": "2024-11-08",
  "notes": "Despensa semanal",
  "paymentMethod": "card",
  "categoryId": 3
}
```

### Registrar pago de servicio

```json
{
  "description": "Pago de luz CFE",
  "amount": 450,
  "date": "2024-11-10",
  "notes": "Recibo bimestral",
  "paymentMethod": "transfer",
  "categoryId": 5
}
```

### Registrar gasolina

```json
{
  "description": "Gasolina Magna",
  "amount": 800,
  "date": "2024-11-08",
  "notes": "Llenado completo",
  "paymentMethod": "cash",
  "categoryId": 4
}
```

### Obtener gastos del mes por tarjeta

```bash
GET /api/expenses?paymentMethod=card&startDate=2024-11-01&endDate=2024-11-30
```

### Obtener gastos de alimentación

```bash
GET /api/expenses?categoryId=3
```

### Ver resumen de gastos con desglose por método de pago

```bash
GET /api/expenses/summary?startDate=2024-11-01&endDate=2024-11-30
```

---

## 📈 Análisis de Gastos

El endpoint `/summary` es especialmente útil para:

1. **Control de presupuesto:** Ver total gastado en un período
2. **Análisis de hábitos:** Identificar gastos más altos/bajos
3. **Método de pago preferido:** Ver distribución por método de pago
4. **Promedio de gastos:** Calcular gasto promedio por transacción
5. **Detección de anomalías:** Identificar gastos inusuales

---

## 🎯 Comparación: Ingresos vs Gastos

| Característica    | Ingresos        | Gastos          |
| ----------------- | --------------- | --------------- |
| Campo principal   | `concept`       | `description`   |
| Campo adicional   | `description`   | `notes`         |
| Tipo de categoría | `income`        | `expense`       |
| Campo extra       | -               | `paymentMethod` |
| Uso típico        | Menos frecuente | Más frecuente   |
