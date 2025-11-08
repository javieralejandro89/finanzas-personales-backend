# 🧪 Colección de Pruebas - Categorías

Ejemplos de requests para probar la API de categorías.

## Variables de Entorno

```json
{
  "baseUrl": "http://localhost:5000",
  "accessToken": "TU_ACCESS_TOKEN_AQUI"
}
```

---

## 1. Crear Categorías de Ingresos

### Salario

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Salario",
  "type": "income",
  "color": "#10B981"
}
```

### Freelance

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Freelance",
  "type": "income",
  "color": "#3B82F6"
}
```

### Inversiones

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Inversiones",
  "type": "income",
  "color": "#8B5CF6"
}
```

### Bonos

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Bonos",
  "type": "income",
  "color": "#14B8A6"
}
```

---

## 2. Crear Categorías de Gastos

### Alimentación

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Alimentación",
  "type": "expense",
  "color": "#EF4444"
}
```

### Transporte

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Transporte",
  "type": "expense",
  "color": "#F59E0B"
}
```

### Entretenimiento

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Entretenimiento",
  "type": "expense",
  "color": "#EC4899"
}
```

### Servicios

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Servicios",
  "type": "expense",
  "color": "#06B6D4"
}
```

### Salud

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Salud",
  "type": "expense",
  "color": "#14B8A6"
}
```

### Educación

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Educación",
  "type": "expense",
  "color": "#8B5CF6"
}
```

### Hogar

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Hogar",
  "type": "expense",
  "color": "#6366F1"
}
```

### Ropa

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Ropa",
  "type": "expense",
  "color": "#A855F7"
}
```

---

## 3. Listar Categorías

### Todas las categorías

```http
GET {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
```

### Solo categorías de ingresos

```http
GET {{baseUrl}}/api/categories?type=income
Authorization: Bearer {{accessToken}}
```

### Solo categorías de gastos

```http
GET {{baseUrl}}/api/categories?type=expense
Authorization: Bearer {{accessToken}}
```

### Solo categorías activas

```http
GET {{baseUrl}}/api/categories?isActive=true
Authorization: Bearer {{accessToken}}
```

### Categorías de ingresos activas

```http
GET {{baseUrl}}/api/categories?type=income&isActive=true
Authorization: Bearer {{accessToken}}
```

---

## 4. Obtener Categoría Específica

```http
GET {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
```

---

## 5. Actualizar Categoría

### Cambiar nombre

```http
PATCH {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Salario Mensual"
}
```

### Cambiar color

```http
PATCH {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "color": "#059669"
}
```

### Desactivar categoría

```http
PATCH {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "isActive": false
}
```

### Cambiar nombre y color

```http
PATCH {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Salario Nómina",
  "color": "#22C55E"
}
```

---

## 6. Estadísticas

### Todas las categorías

```http
GET {{baseUrl}}/api/categories/stats
Authorization: Bearer {{accessToken}}
```

### Solo ingresos

```http
GET {{baseUrl}}/api/categories/stats?type=income
Authorization: Bearer {{accessToken}}
```

### Solo gastos

```http
GET {{baseUrl}}/api/categories/stats?type=expense
Authorization: Bearer {{accessToken}}
```

### Con rango de fechas

```http
GET {{baseUrl}}/api/categories/stats?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {{accessToken}}
```

### Gastos de noviembre 2024

```http
GET {{baseUrl}}/api/categories/stats?type=expense&startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer {{accessToken}}
```

---

## 7. Eliminar Categoría

```http
DELETE {{baseUrl}}/api/categories/1
Authorization: Bearer {{accessToken}}
```

---

## 8. Casos de Error

### Crear categoría duplicada

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Salario",
  "type": "income",
  "color": "#10B981"
}
```

**Respuesta esperada:** 409 Conflict

### Color inválido

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Inversiones",
  "type": "income",
  "color": "verde"
}
```

**Respuesta esperada:** 422 Unprocessable Entity

### Tipo inválido

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Otros",
  "type": "other",
  "color": "#6B7280"
}
```

**Respuesta esperada:** 422 Unprocessable Entity

### Sin autenticación

```http
GET {{baseUrl}}/api/categories
```

**Respuesta esperada:** 401 Unauthorized

### Categoría inexistente

```http
GET {{baseUrl}}/api/categories/9999
Authorization: Bearer {{accessToken}}
```

**Respuesta esperada:** 404 Not Found

---

## 💡 Secuencia de Pruebas Recomendada

1. ✅ Login para obtener accessToken
2. ✅ Crear 3-4 categorías de ingresos
3. ✅ Crear 5-6 categorías de gastos
4. ✅ Listar todas las categorías
5. ✅ Filtrar por tipo (income/expense)
6. ✅ Obtener una categoría específica
7. ✅ Actualizar nombre y color
8. ✅ Ver estadísticas (aún sin datos)
9. ✅ Desactivar una categoría
10. ✅ Intentar crear duplicada (error esperado)
11. ✅ Intentar con color inválido (error esperado)

---

## 🔄 Script de Inicialización

Para crear categorías básicas de un nuevo usuario:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"
TOKEN="YOUR_ACCESS_TOKEN"

# Categorías de Ingresos
curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Salario","type":"income","color":"#10B981"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Freelance","type":"income","color":"#3B82F6"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Inversiones","type":"income","color":"#8B5CF6"}'

# Categorías de Gastos
curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alimentación","type":"expense","color":"#EF4444"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Transporte","type":"expense","color":"#F59E0B"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Entretenimiento","type":"expense","color":"#EC4899"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Servicios","type":"expense","color":"#06B6D4"}'

curl -X POST "$BASE_URL/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Salud","type":"expense","color":"#14B8A6"}'

echo "✅ Categorías creadas exitosamente"
```

Guarda este script como `create-categories.sh`, dale permisos de ejecución y ejecútalo:

```bash
chmod +x create-categories.sh
./create-categories.sh
```
