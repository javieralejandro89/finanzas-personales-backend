# 🧪 Guía de Pruebas - Dashboard

Pasos para probar todos los endpoints del dashboard.

## 📋 Pre-requisitos

1. Backend corriendo: `npm run dev`
2. Datos de prueba creados: `npm run prisma:seed`
3. Token de acceso obtenido (login)

```bash
# Variable para el token
TOKEN="tu_access_token_aqui"
BASE="http://localhost:5000"
```

---

## 1️⃣ Resumen Financiero

### Resumen del mes actual

```bash
curl -X GET "$BASE/api/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**

- Total de ingresos
- Total de gastos
- Balance (ingresos - gastos)
- Tasa de ahorro (%)
- Contadores de transacciones

### Resumen de noviembre 2024

```bash
curl -X GET "$BASE/api/dashboard/summary?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

### Resumen de octubre 2024

```bash
curl -X GET "$BASE/api/dashboard/summary?startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2️⃣ Desglose por Categorías

### Top categorías del mes actual

```bash
curl -X GET "$BASE/api/dashboard/categories" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**

- Top 5 categorías de ingresos con porcentajes
- Top 5 categorías de gastos con porcentajes
- Colores de cada categoría

### Top categorías de noviembre

```bash
curl -X GET "$BASE/api/dashboard/categories?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3️⃣ Tendencias Mensuales

### Últimos 6 meses (default)

```bash
curl -X GET "$BASE/api/dashboard/trends" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**

- Array de 6 meses con:
  - Ingresos por mes
  - Gastos por mes
  - Balance por mes
  - Tasa de ahorro por mes

### Últimos 12 meses

```bash
curl -X GET "$BASE/api/dashboard/trends?months=12" \
  -H "Authorization: Bearer $TOKEN"
```

### Últimos 3 meses

```bash
curl -X GET "$BASE/api/dashboard/trends?months=3" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4️⃣ Comparación de Períodos

### Noviembre vs Octubre 2024

```bash
curl -X GET "$BASE/api/dashboard/comparison?period1Start=2024-10-01&period1End=2024-10-31&period2Start=2024-11-01&period2End=2024-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**

- Datos de período 1 (octubre)
- Datos de período 2 (noviembre)
- Cambios porcentuales en:
  - Ingresos
  - Gastos
  - Balance

### Q3 vs Q4 2024 (Trimestres)

```bash
curl -X GET "$BASE/api/dashboard/comparison?period1Start=2024-07-01&period1End=2024-09-30&period2Start=2024-10-01&period2End=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Primer vs Segundo Semestre 2024

```bash
curl -X GET "$BASE/api/dashboard/comparison?period1Start=2024-01-01&period1End=2024-06-30&period2Start=2024-07-01&period2End=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5️⃣ Transacciones Recientes

### Últimas 10 transacciones (default)

```bash
curl -X GET "$BASE/api/dashboard/recent" \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado esperado:**

- Array de transacciones (ingresos y gastos mezclados)
- Ordenadas por fecha descendente
- Cada una con su categoría y detalles

### Últimas 20 transacciones

```bash
curl -X GET "$BASE/api/dashboard/recent?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Últimas 5 transacciones

```bash
curl -X GET "$BASE/api/dashboard/recent?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Secuencia de Prueba Completa

### Script completo para probar todo

```bash
#!/bin/bash

# Configuración
TOKEN="tu_access_token_aqui"
BASE="http://localhost:5000"

echo "🧪 Probando Dashboard API..."
echo ""

# 1. Resumen
echo "📊 1. Resumen financiero del mes actual"
curl -s -X GET "$BASE/api/dashboard/summary" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 2. Categorías
echo "📁 2. Top categorías del mes actual"
curl -s -X GET "$BASE/api/dashboard/categories" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 3. Tendencias
echo "📈 3. Tendencias de últimos 6 meses"
curl -s -X GET "$BASE/api/dashboard/trends" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. Comparación
echo "🔄 4. Comparación noviembre vs octubre"
curl -s -X GET "$BASE/api/dashboard/comparison?period1Start=2024-10-01&period1End=2024-10-31&period2Start=2024-11-01&period2End=2024-11-30" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 5. Recientes
echo "⏱️ 5. Últimas 10 transacciones"
curl -s -X GET "$BASE/api/dashboard/recent?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✅ Pruebas completadas!"
```

**Guardar como:** `test-dashboard.sh`

**Ejecutar:**

```bash
chmod +x test-dashboard.sh
./test-dashboard.sh
```

---

## ✅ Checklist de Validación

### Resumen Financiero

- [ ] Retorna datos del período correcto
- [ ] Balance = Ingresos - Gastos
- [ ] Savings Rate está entre 0-100
- [ ] Contadores coinciden con transacciones reales

### Categorías

- [ ] Retorna máximo 5 categorías por tipo
- [ ] Porcentajes suman cerca de 100% (puede variar por redondeo)
- [ ] Colores están en formato hexadecimal
- [ ] Ordenadas por total descendente

### Tendencias

- [ ] Retorna cantidad correcta de meses
- [ ] Datos ordenados cronológicamente
- [ ] Balance = Income - Expenses para cada mes
- [ ] Nombres de meses en español

### Comparación

- [ ] Retorna datos de ambos períodos
- [ ] Cambios calculados correctamente
- [ ] Porcentajes con signo correcto (+ aumento, - disminución)

### Transacciones Recientes

- [ ] Cantidad correcta de transacciones
- [ ] Ordenadas por fecha descendente
- [ ] Tipo correcto (income/expense)
- [ ] Incluye información de categoría

---

## 🐛 Troubleshooting

### Error: "No autorizado"

```
Solución: Verificar que el token de acceso sea válido
- Hacer login para obtener nuevo token
- Verificar que el token no haya expirado (15 minutos)
```

### Error: "Período inválido"

```
Solución: Verificar formato de fechas
- Usar formato ISO8601: YYYY-MM-DD
- Ejemplo: 2024-11-01
```

### Resultado: Datos vacíos

```
Solución: Verificar que haya transacciones
- Ejecutar seed: npm run prisma:seed
- Crear transacciones manualmente
- Verificar el rango de fechas
```

### Error: "months debe ser entre 1 y 12"

```
Solución: Ajustar parámetro months
- Valor mínimo: 1
- Valor máximo: 12
```

---

## 📈 Interpretación de Resultados

### Savings Rate (Tasa de Ahorro)

```
< 0%    : Gastos superan ingresos (déficit)
0-10%   : Ahorro muy bajo
10-20%  : Ahorro moderado
20-30%  : Buen ahorro
30-50%  : Excelente ahorro
> 50%   : Ahorro muy alto
```

### Cambios Porcentuales

```
> 10%   : Cambio significativo
5-10%   : Cambio moderado
0-5%    : Cambio leve
< 0%    : Disminución
```

### Distribución de Gastos

```
1 categoría > 50%   : Muy concentrado
2-3 categorías 70%  : Concentrado
5+ categorías       : Bien distribuido
```

---

## 🎯 Casos de Uso Reales

### Dashboard Principal

```bash
# Vista general del mes
GET /api/dashboard/summary
GET /api/dashboard/categories
GET /api/dashboard/recent?limit=5
```

### Análisis Mensual

```bash
# Revisar mes completo
GET /api/dashboard/summary?startDate=2024-10-01&endDate=2024-10-31
GET /api/dashboard/categories?startDate=2024-10-01&endDate=2024-10-31
```

### Reporte Anual

```bash
# Ver tendencias del año
GET /api/dashboard/trends?months=12

# Comparar con año anterior
GET /api/dashboard/comparison?period1Start=2023-01-01&period1End=2023-12-31&period2Start=2024-01-01&period2End=2024-12-31
```

### Seguimiento Semanal

```bash
# Esta semana vs semana pasada
GET /api/dashboard/comparison?period1Start=2024-11-01&period1End=2024-11-07&period2Start=2024-11-08&period2End=2024-11-14
```

---

## 💡 Tips de Testing

1. **Crear datos variados:** Usa el seed para tener suficiente información
2. **Probar rangos diversos:** Días, semanas, meses, trimestres, años
3. **Verificar edge cases:** Sin datos, un solo registro, muchos registros
4. **Validar cálculos:** Verificar manualmente algunos cálculos
5. **Probar límites:** Máximo de meses (12), máximo de transacciones recientes (50)

---

## 🚀 Siguiente Paso

Una vez probado el dashboard, puedes:

1. Integrar con el frontend
2. Agregar más métricas (ROI, proyecciones)
3. Implementar caché para mejor performance
4. Crear reportes en PDF
