# 📚 Resumen Completo de la API

Documentación rápida de todos los endpoints disponibles.

## 🔐 Autenticación

**Base:** `/api/auth`

| Método | Endpoint               | Descripción             | Auth |
| ------ | ---------------------- | ----------------------- | ---- |
| POST   | `/register`            | Registrar usuario       | No   |
| POST   | `/login`               | Iniciar sesión          | No   |
| POST   | `/refresh`             | Refrescar access token  | No   |
| POST   | `/logout`              | Cerrar sesión           | No   |
| GET    | `/profile`             | Obtener perfil          | Sí   |
| PATCH  | `/profile`             | Actualizar perfil       | Sí   |
| POST   | `/change-password`     | Cambiar contraseña      | Sí   |
| GET    | `/sessions`            | Listar sesiones activas | Sí   |
| DELETE | `/sessions/:sessionId` | Eliminar sesión         | Sí   |

---

## 📁 Categorías

**Base:** `/api/categories`

| Método | Endpoint | Descripción                   | Auth |
| ------ | -------- | ----------------------------- | ---- |
| POST   | `/`      | Crear categoría               | Sí   |
| GET    | `/`      | Listar categorías             | Sí   |
| GET    | `/stats` | Estadísticas de categorías    | Sí   |
| GET    | `/:id`   | Obtener categoría por ID      | Sí   |
| PATCH  | `/:id`   | Actualizar categoría          | Sí   |
| DELETE | `/:id`   | Eliminar/desactivar categoría | Sí   |

**Query params para listar:**

- `type`: income/expense
- `isActive`: true/false

**Query params para stats:**

- `type`: income/expense
- `startDate`: ISO8601
- `endDate`: ISO8601

---

## 💰 Ingresos

**Base:** `/api/incomes`

| Método | Endpoint   | Descripción            | Auth |
| ------ | ---------- | ---------------------- | ---- |
| POST   | `/`        | Crear ingreso          | Sí   |
| GET    | `/`        | Listar ingresos        | Sí   |
| GET    | `/summary` | Resumen de ingresos    | Sí   |
| GET    | `/:id`     | Obtener ingreso por ID | Sí   |
| PATCH  | `/:id`     | Actualizar ingreso     | Sí   |
| DELETE | `/:id`     | Eliminar ingreso       | Sí   |

**Query params para listar:**

- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 20, max: 100)
- `categoryId`: Filtrar por categoría
- `startDate`: ISO8601
- `endDate`: ISO8601

**Query params para summary:**

- `startDate`: ISO8601
- `endDate`: ISO8601

---

## 💸 Gastos

**Base:** `/api/expenses`

| Método | Endpoint   | Descripción          | Auth |
| ------ | ---------- | -------------------- | ---- |
| POST   | `/`        | Crear gasto          | Sí   |
| GET    | `/`        | Listar gastos        | Sí   |
| GET    | `/summary` | Resumen de gastos    | Sí   |
| GET    | `/:id`     | Obtener gasto por ID | Sí   |
| PATCH  | `/:id`     | Actualizar gasto     | Sí   |
| DELETE | `/:id`     | Eliminar gasto       | Sí   |

**Query params para listar:**

- `page`: Número de página (default: 1)
- `limit`: Registros por página (default: 20, max: 100)
- `categoryId`: Filtrar por categoría
- `paymentMethod`: cash/card/transfer/check/other
- `startDate`: ISO8601
- `endDate`: ISO8601

**Query params para summary:**

- `startDate`: ISO8601
- `endDate`: ISO8601

---

## 📊 Dashboard

**Base:** `/api/dashboard`

| Método | Endpoint      | Descripción                | Auth |
| ------ | ------------- | -------------------------- | ---- |
| GET    | `/summary`    | Resumen financiero general | Sí   |
| GET    | `/categories` | Top 5 categorías por tipo  | Sí   |
| GET    | `/trends`     | Tendencias mensuales       | Sí   |
| GET    | `/comparison` | Comparar dos períodos      | Sí   |
| GET    | `/recent`     | Transacciones recientes    | Sí   |

**Query params para summary:**

- `startDate`: ISO8601 (default: inicio mes actual)
- `endDate`: ISO8601 (default: fin mes actual)

**Query params para categories:**

- `startDate`: ISO8601 (default: inicio mes actual)
- `endDate`: ISO8601 (default: fin mes actual)

**Query params para trends:**

- `months`: 1-12 (default: 6)

**Query params para comparison:**

- `period1Start`: ISO8601 (requerido)
- `period1End`: ISO8601 (requerido)
- `period2Start`: ISO8601 (requerido)
- `period2End`: ISO8601 (requerido)

**Query params para recent:**

- `limit`: 1-50 (default: 10)

---

## 🎯 Flujo de Uso Típico

### 1. Registro e Inicio de Sesión

```bash
# Registrarse
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Test123456",
  "currency": "MXN"
}

# O hacer login
POST /api/auth/login
{
  "email": "juan@example.com",
  "password": "Test123456"
}

# Respuesta con tokens
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

### 2. Crear Categorías

```bash
# Categoría de ingresos
POST /api/categories
Authorization: Bearer {accessToken}
{
  "name": "Salario",
  "type": "income",
  "color": "#10B981"
}

# Categoría de gastos
POST /api/categories
Authorization: Bearer {accessToken}
{
  "name": "Alimentación",
  "type": "expense",
  "color": "#EF4444"
}
```

### 3. Registrar Transacciones

```bash
# Registrar ingreso
POST /api/incomes
Authorization: Bearer {accessToken}
{
  "concept": "Salario mensual",
  "amount": 25000,
  "date": "2024-11-01",
  "description": "Salario de noviembre",
  "categoryId": 1
}

# Registrar gasto
POST /api/expenses
Authorization: Bearer {accessToken}
{
  "description": "Compra en supermercado",
  "amount": 1500,
  "date": "2024-11-08",
  "notes": "Despensa semanal",
  "paymentMethod": "card",
  "categoryId": 3
}
```

### 4. Consultar Información

```bash
# Listar todas las transacciones del mes
GET /api/incomes?startDate=2024-11-01&endDate=2024-11-30
GET /api/expenses?startDate=2024-11-01&endDate=2024-11-30

# Ver resúmenes
GET /api/incomes/summary?startDate=2024-11-01&endDate=2024-11-30
GET /api/expenses/summary?startDate=2024-11-01&endDate=2024-11-30

# Ver estadísticas por categoría
GET /api/categories/stats?startDate=2024-11-01&endDate=2024-11-30
```

---

## 🔑 Autenticación

Todos los endpoints (excepto `/auth/register`, `/auth/login`, `/auth/refresh` y `/auth/logout`) requieren autenticación.

**Header requerido:**

```
Authorization: Bearer {accessToken}
```

**Tokens:**

- **Access Token:** 15 minutos de duración
- **Refresh Token:** 7 días de duración

**Renovación automática:**

```bash
POST /api/auth/refresh
{
  "refreshToken": "..."
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado                                    |
| ------ | ---------------------------------------------- |
| 200    | OK - Solicitud exitosa                         |
| 201    | Created - Recurso creado                       |
| 400    | Bad Request - Datos inválidos                  |
| 401    | Unauthorized - No autenticado o token inválido |
| 403    | Forbidden - Sin permisos                       |
| 404    | Not Found - Recurso no encontrado              |
| 409    | Conflict - Conflicto (ej: email duplicado)     |
| 422    | Unprocessable Entity - Error de validación     |
| 500    | Internal Server Error - Error del servidor     |

---

## 💡 Características Clave

### Precisión Decimal

Todos los montos usan **dinero.js** para evitar errores de punto flotante:

```javascript
0.1 + 0.2 = 0.30000000000004 ❌
dinero.js: 0.1 + 0.2 = 0.30 ✅
```

### Paginación

- Default: 20 registros por página
- Máximo: 100 registros por página
- Ordenamiento: Por fecha descendente

### Validaciones

- Backend: express-validator
- Frontend: react-hook-form + Zod
- Montos: Siempre positivos
- Fechas: Formato ISO8601

### Seguridad

- Passwords hasheados con bcrypt
- JWT con access y refresh tokens
- Sesiones rastreables (IP, user agent)
- Validación de propietario en todos los recursos

---

## 🧪 Testing Rápido

### Con cURL

```bash
# Variables
TOKEN="tu_access_token_aqui"
BASE="http://localhost:5000"

# Login
curl -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"Test123456"}'

# Listar categorías
curl -X GET $BASE/api/categories \
  -H "Authorization: Bearer $TOKEN"

# Crear ingreso
curl -X POST $BASE/api/incomes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"concept":"Salario","amount":25000,"date":"2024-11-01","categoryId":1}'

# Crear gasto
curl -X POST $BASE/api/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Supermercado","amount":1500,"date":"2024-11-08","categoryId":3}'
```

### Con Postman/Thunder Client

Importar colecciones desde:

- `docs/AUTH_API.md`
- `docs/CATEGORIES_API.md`
- `docs/INCOMES_API.md`
- `docs/EXPENSES_API.md`

---

## 📁 Documentación Completa

Para más detalles, consultar:

- **Autenticación:** `docs/AUTH_API.md`
- **Categorías:** `docs/CATEGORIES_API.md` + `docs/CATEGORIES_TESTS.md`
- **Ingresos:** `docs/INCOMES_API.md`
- **Gastos:** `docs/EXPENSES_API.md`

---

## 🚀 Iniciar el Servidor

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente Prisma
npm run prisma:generate

# Aplicar migraciones
npm run prisma:push

# Crear datos de prueba (opcional)
npm run prisma:seed

# Iniciar servidor
npm run dev
```

**Health check:**

```bash
curl http://localhost:5000/health
```

---

## 📈 Próximas Features

- [ ] Dashboard con estadísticas
- [ ] Reportes en PDF
- [ ] Gráficas avanzadas
- [ ] Exportar a Excel
- [ ] Presupuestos
- [ ] Metas de ahorro
- [ ] Recordatorios
- [ ] Multi-moneda con conversión
- [ ] API pública
- [ ] Webhooks

---

## 🎯 Estado Actual

| Módulo        | Estado       | Endpoints | Documentación |
| ------------- | ------------ | --------- | ------------- |
| Autenticación | ✅ Completo  | 9         | Completa      |
| Categorías    | ✅ Completo  | 6         | Completa      |
| Ingresos      | ✅ Completo  | 6         | Completa      |
| Gastos        | ✅ Completo  | 6         | Completa      |
| Dashboard     | ✅ Completo  | 5         | Completa      |
| Reportes      | 🚧 Pendiente | -         | -             |

**Total endpoints activos:** 32
