---
title: Guía de Estilos
author: Equipo TalkRev
date: 2026-01-15
---

# Guía de Estilos

Convenciones de código y mejores prácticas para el equipo TalkRev.

## TypeScript

### Naming conventions

```typescript
// ✅ Interfaces con PascalCase
interface UserProfile {
  id: string;
  firstName: string;
}

// ✅ Types con PascalCase
type ButtonVariant = "primary" | "secondary";

// ✅ Variables y funciones con camelCase
const userName = "John";
function getUserById(id: string) { ... }

// ✅ Constantes con SCREAMING_SNAKE_CASE
const API_BASE_URL = "https://api.talkrev.com";
const MAX_RETRY_COUNT = 3;
```

### Componentes React

```tsx
// ✅ Componentes con PascalCase
function UserCard({ user }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
    </div>
  );
}

// ✅ Props interface separada
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}
```

## CSS / Tailwind

### Orden de clases

Seguimos este orden para las clases de Tailwind:

1. Layout (flex, grid, position)
2. Sizing (w-, h-, p-, m-)
3. Typography (text-, font-)
4. Colors (bg-, text-, border-)
5. Effects (shadow-, opacity-)
6. Transitions (transition-, duration-)

```tsx
// ✅ Correcto
<div className="flex items-center gap-4 p-4 text-sm font-medium bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">

// ❌ Incorrecto (sin orden)
<div className="bg-white p-4 flex shadow-sm text-sm rounded-lg">
```

## Git

### Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos permitidos
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato (no afectan código)
refactor: refactorización
test: añadir/modificar tests
chore: tareas de mantenimiento
```

### Branches

```bash
# Feature
feature/add-user-profile

# Bugfix
fix/login-redirect-issue

# Hotfix
hotfix/critical-security-patch
```

## Documentación

- Escribe en español
- Usa Markdown para formatear
- Incluye ejemplos de código
- Mantén actualizada la documentación

## Herramientas

- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **TypeScript**: Tipado estático
- **Husky**: Git hooks
