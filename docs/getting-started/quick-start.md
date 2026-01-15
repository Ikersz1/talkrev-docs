---
title: Inicio Rápido
author: Equipo TalkRev
date: 2026-01-15
---

# Inicio Rápido

Esta guía te ayudará a configurar tu entorno de desarrollo en menos de 5 minutos.

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** 18.0 o superior
- **npm** o **pnpm**
- **Git**
- Un editor de código (recomendamos VS Code)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/talkrev/proyecto.git
cd proyecto
```

### 2. Instalar dependencias

```bash
npm install
# o con pnpm
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Siguiente paso

Una vez que tengas el proyecto corriendo, consulta:

- [Estructura del proyecto](/docs/guides/project-structure)
- [Guía de estilos](/docs/guides/style-guide)
- [Documentación de API](/docs/api/overview)

## ¿Problemas?

Si encuentras algún problema durante la instalación:

1. Verifica que cumples con los requisitos previos
2. Elimina `node_modules` y vuelve a instalar
3. Consulta el canal de Slack #dev-help
