# 🔐 API de Autenticación

Documentación completa de todos los endpoints de autenticación.

## Base URL

```
http://localhost:5000/api/auth
```

---

## 📋 Endpoints

### 1. Registro de Usuario

**POST** `/register`

Crear una nueva cuenta de usuario.

**Body:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Test123456",
  "currency": "MXN"
}
```

**Validaciones:**

- `name`: 2-100 caracteres
- `email`: Email válido, único
- `password`: 8-100 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
- `currency`: Opcional (MXN, USD, EUR, GBP, CAD, ARS, COP, CLP)

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "currency": "MXN",
      "createdAt": "2024-11-08T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 2. Login

**POST** `/login`

Iniciar sesión con credenciales.

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "Test123456"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "currency": "MXN"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Errores:**

- `401`: Credenciales inválidas
- `401`: Usuario inactivo

---

### 3. Refresh Token

**POST** `/refresh`

Obtener un nuevo access token usando el refresh token.

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**

- `401`: Token inválido o expirado
- `401`: Sesión no encontrada

---

### 4. Logout

**POST** `/logout`

Cerrar sesión (invalida el refresh token).

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### 5. Obtener Perfil

**GET** `/profile`

Obtener información del usuario autenticado.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "currency": "MXN",
    "isActive": true,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

---

### 6. Actualizar Perfil

**PATCH** `/profile`

Actualizar información del perfil.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "name": "Juan Carlos Pérez",
  "currency": "USD"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": 1,
    "name": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "currency": "USD",
    "updatedAt": "2024-11-08T11:00:00.000Z"
  }
}
```

---

### 7. Cambiar Contraseña

**POST** `/change-password`

Cambiar la contraseña del usuario.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Body:**

```json
{
  "currentPassword": "Test123456",
  "newPassword": "NewTest123456",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente. Otras sesiones han sido cerradas."
}
```

**Notas:**

- Cierra todas las sesiones excepto la actual
- El `refreshToken` actual es opcional pero recomendado para mantener la sesión activa

---

### 8. Listar Sesiones

**GET** `/sessions`

Obtener todas las sesiones activas del usuario.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.100",
      "createdAt": "2024-11-08T10:30:00.000Z",
      "expiresAt": "2024-11-15T10:30:00.000Z"
    },
    {
      "id": "uuid-456",
      "userAgent": "PostmanRuntime/7.32.3",
      "ipAddress": "192.168.1.101",
      "createdAt": "2024-11-07T15:20:00.000Z",
      "expiresAt": "2024-11-14T15:20:00.000Z"
    }
  ]
}
```

---

### 9. Eliminar Sesión

**DELETE** `/sessions/:sessionId`

Cerrar una sesión específica.

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Params:**

- `sessionId`: UUID de la sesión

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Sesión eliminada exitosamente"
}
```

**Errores:**

- `404`: Sesión no encontrada o no pertenece al usuario

---

## 🔑 Manejo de Tokens

### Access Token

- **Duración:** 15 minutos
- **Uso:** Header `Authorization: Bearer {token}`
- **Renovación:** Usar endpoint `/refresh`

### Refresh Token

- **Duración:** 7 días
- **Uso:** Body de endpoints `/refresh` y `/logout`
- **Almacenamiento:** Guardar de forma segura (localStorage, cookie httpOnly)

---

## 🧪 Testing con cURL

### Registro

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "currency": "MXN"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Obtener Perfil

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📊 Códigos de Estado

| Código | Significado                                    |
| ------ | ---------------------------------------------- |
| 200    | OK - Solicitud exitosa                         |
| 201    | Created - Recurso creado exitosamente          |
| 400    | Bad Request - Datos inválidos                  |
| 401    | Unauthorized - No autenticado o token inválido |
| 404    | Not Found - Recurso no encontrado              |
| 409    | Conflict - Email ya registrado                 |
| 422    | Unprocessable Entity - Error de validación     |
| 500    | Internal Server Error - Error del servidor     |

---

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT firmados con secret keys
- Sesiones rastreables por IP y user agent
- Invalidación de sesiones al cambiar contraseña
- Validación estricta de inputs
- Rate limiting recomendado (implementar en producción)

---

## 💡 Mejores Prácticas

1. **Almacenamiento de Tokens:**

   - Access Token: En memoria (estado de React/Zustand)
   - Refresh Token: localStorage o httpOnly cookie

2. **Renovación Automática:**

   - Implementar interceptor de Axios para renovar automáticamente

3. **Logout:**

   - Siempre llamar al endpoint para invalidar el refresh token

4. **Sesiones:**
   - Revisar periódicamente y cerrar sesiones inactivas
