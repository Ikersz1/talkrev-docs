---
title: API Overview
author: Equipo TalkRev
date: 2026-01-15
---

# API Overview

Documentación de las APIs internas de TalkRev.

## Base URL

Todas las APIs usan la siguiente URL base:

```
https://api.talkrev.com/v1
```

Para desarrollo local:

```
http://localhost:3000/api
```

## Autenticación

Todas las peticiones requieren autenticación mediante Bearer token:

```bash
curl -H "Authorization: Bearer <token>" \
  https://api.talkrev.com/v1/users
```

## Endpoints principales

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users` | Lista usuarios |
| GET | `/users/:id` | Obtiene un usuario |
| POST | `/users` | Crea usuario |
| PUT | `/users/:id` | Actualiza usuario |
| DELETE | `/users/:id` | Elimina usuario |

### Organizaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/organizations` | Lista organizaciones |
| GET | `/organizations/:id` | Obtiene organización |
| POST | `/organizations` | Crea organización |

## Respuestas

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Errores

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo email es requerido",
    "details": { ... }
  }
}
```

## Rate Limiting

- **100 requests/minuto** para endpoints públicos
- **1000 requests/minuto** para endpoints autenticados

## SDKs

Tenemos SDKs oficiales para:

- [JavaScript/TypeScript](https://github.com/talkrev/sdk-js)
- [Python](https://github.com/talkrev/sdk-python)
