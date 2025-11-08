# 📁 API de Categorías

Documentación completa de todos los endpoints de categorías.

## Base URL

```
http://localhost:5000/api/categories
```

**Nota:** Todos los endpoints requieren autenticación con Bearer token.

---

## 📋 Endpoints

### 1. Crear Categoría

**POST** `/`

Crear una nueva categoría de ingreso o gasto.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "name": "Salario",
  "type": "income",
  "color": "#10B981"
}
```

**Validaciones:**

- `name`: 2-100 caracteres, requerido
- `type`: "income" o "expense", requerido
- `color`: Color hexadecimal válido (opcional, default: #6B7280)

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": 1,
    "name": "Salario",
    "type": "income",
    "color": "#10B981",
    "isActive": true,
    "userId": 1,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

**Errores:**

- `409`: Ya existe una categoría con ese nombre y tipo
- `400`: Color hexadecimal inválido

---

### 2. Listar Categorías

**GET** `/`

Obtener todas las categorías del usuario autenticado.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `type`: Filtrar por tipo ("income" o "expense")
- `isActive`: Filtrar por estado ("true" o "false")

**Ejemplos:**

```
GET /api/categories
GET /api/categories?type=income
GET /api/categories?type=expense&isActive=true
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Salario",
      "type": "income",
      "color": "#10B981",
      "isActive": true,
      "userId": 1,
      "createdAt": "2024-11-08T10:30:00.000Z",
      "updatedAt": "2024-11-08T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Alimentación",
      "type": "expense",
      "color": "#EF4444",
      "isActive": true,
      "userId": 1,
      "createdAt": "2024-11-08T10:35:00.000Z",
      "updatedAt": "2024-11-08T10:35:00.000Z"
    }
  ]
}
```

---

### 3. Obtener Categoría por ID

**GET** `/:id`

Obtener detalles de una categoría específica.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID de la categoría (entero)

**Ejemplo:**

```
GET /api/categories/1
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Salario",
    "type": "income",
    "color": "#10B981",
    "isActive": true,
    "userId": 1,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

**Errores:**

- `404`: Categoría no encontrada o no pertenece al usuario

---

### 4. Actualizar Categoría

**PATCH** `/:id`

Actualizar información de una categoría.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID de la categoría

**Body (todos los campos son opcionales):**

```json
{
  "name": "Salario Mensual",
  "color": "#059669",
  "isActive": true
}
```

**Notas:**

- No se puede cambiar el `type` de una categoría
- El nombre debe ser único dentro del mismo tipo

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Categoría actualizada exitosamente",
  "data": {
    "id": 1,
    "name": "Salario Mensual",
    "type": "income",
    "color": "#059669",
    "isActive": true,
    "userId": 1,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T11:00:00.000Z"
  }
}
```

**Errores:**

- `404`: Categoría no encontrada
- `409`: Ya existe otra categoría con ese nombre
- `400`: Color hexadecimal inválido

---

### 5. Eliminar Categoría

**DELETE** `/:id`

Eliminar o desactivar una categoría.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `id`: ID de la categoría

**Comportamiento:**

- **Si tiene transacciones asociadas:** La categoría se desactiva (`isActive: false`)
- **Si NO tiene transacciones:** La categoría se elimina permanentemente

**Respuesta exitosa (200) - Con transacciones:**

```json
{
  "success": true,
  "message": "Categoría desactivada exitosamente. No se puede eliminar porque tiene transacciones asociadas."
}
```

**Respuesta exitosa (200) - Sin transacciones:**

```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente"
}
```

**Errores:**

- `404`: Categoría no encontrada

---

### 6. Estadísticas de Categorías

**GET** `/stats`

Obtener estadísticas de uso de categorías (total gastado/ingresado por categoría).

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Params (opcionales):**

- `type`: Filtrar por tipo ("income" o "expense")
- `startDate`: Fecha de inicio (ISO8601)
- `endDate`: Fecha de fin (ISO8601)

**Ejemplos:**

```
GET /api/categories/stats
GET /api/categories/stats?type=expense
GET /api/categories/stats?startDate=2024-11-01&endDate=2024-11-30
```

**Respuesta exitosa (200) - Sin filtro de tipo:**

```json
{
  "success": true,
  "data": {
    "incomes": [
      {
        "categoryId": 1,
        "categoryName": "Salario",
        "categoryColor": "#10B981",
        "total": "50000.00",
        "count": 2
      },
      {
        "categoryId": 2,
        "categoryName": "Freelance",
        "categoryColor": "#3B82F6",
        "total": "15000.00",
        "count": 5
      }
    ],
    "expenses": [
      {
        "categoryId": 3,
        "categoryName": "Alimentación",
        "categoryColor": "#EF4444",
        "total": "8500.00",
        "count": 12
      },
      {
        "categoryId": 4,
        "categoryName": "Transporte",
        "categoryColor": "#F59E0B",
        "total": "3200.00",
        "count": 8
      }
    ]
  }
}
```

**Respuesta exitosa (200) - Con filtro type=income:**

```json
{
  "success": true,
  "data": {
    "incomes": [
      {
        "categoryId": 1,
        "categoryName": "Salario",
        "categoryColor": "#10B981",
        "total": "50000.00",
        "count": 2
      }
    ]
  }
}
```

---

## 🎨 Colores Recomendados

### Categorías de Ingresos (tonos verdes/azules):

```
Verde Claro:  #10B981
Azul:         #3B82F6
Morado:       #8B5CF6
Cyan:         #06B6D4
Verde Agua:   #14B8A6
```

### Categorías de Gastos (tonos cálidos):

```
Rojo:         #EF4444
Naranja:      #F59E0B
Rosa:         #EC4899
Amarillo:     #F59E0B
Rojo Oscuro:  #DC2626
```

---

## 🧪 Testing con cURL

### Crear categoría de ingreso

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salario",
    "type": "income",
    "color": "#10B981"
  }'
```

### Crear categoría de gasto

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alimentación",
    "type": "expense",
    "color": "#EF4444"
  }'
```

### Listar todas las categorías

```bash
curl -X GET http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Listar solo categorías de ingresos activas

```bash
curl -X GET "http://localhost:5000/api/categories?type=income&isActive=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Actualizar categoría

```bash
curl -X PATCH http://localhost:5000/api/categories/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salario Mensual",
    "color": "#059669"
  }'
```

### Obtener estadísticas

```bash
curl -X GET http://localhost:5000/api/categories/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Eliminar categoría

```bash
curl -X DELETE http://localhost:5000/api/categories/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 💡 Mejores Prácticas

1. **Nombres descriptivos:** Usar nombres claros y específicos
2. **Colores consistentes:** Mantener una paleta de colores coherente
3. **No eliminar categorías activas:** Desactivar en lugar de eliminar
4. **Categorías predefinidas:** Crear categorías básicas al registrar usuario
5. **Límite de categorías:** Considerar un máximo por usuario (ej: 50)

---

## 🔍 Casos de Uso

### Crear categorías iniciales para un usuario

```javascript
const defaultCategories = [
  // Ingresos
  { name: "Salario", type: "income", color: "#10B981" },
  { name: "Freelance", type: "income", color: "#3B82F6" },
  { name: "Inversiones", type: "income", color: "#8B5CF6" },

  // Gastos
  { name: "Alimentación", type: "expense", color: "#EF4444" },
  { name: "Transporte", type: "expense", color: "#F59E0B" },
  { name: "Entretenimiento", type: "expense", color: "#EC4899" },
  { name: "Servicios", type: "expense", color: "#06B6D4" },
  { name: "Salud", type: "expense", color: "#14B8A6" },
];
```

### Filtrar categorías en el frontend

```javascript
// Solo categorías activas de ingresos
GET /api/categories?type=income&isActive=true

// Solo categorías activas de gastos
GET /api/categories?type=expense&isActive=true

// Todas las categorías (incluso inactivas)
GET /api/categories
```

---

## 📊 Códigos de Estado

| Código | Significado                                |
| ------ | ------------------------------------------ |
| 200    | OK - Solicitud exitosa                     |
| 201    | Created - Categoría creada                 |
| 400    | Bad Request - Datos inválidos              |
| 401    | Unauthorized - Token inválido              |
| 404    | Not Found - Categoría no encontrada        |
| 409    | Conflict - Categoría duplicada             |
| 422    | Unprocessable Entity - Error de validación |
| 500    | Internal Server Error - Error del servidor |
