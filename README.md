# TalkRev Docs

Plataforma de documentación interna para el equipo TalkRev.

## ✨ Características

- 📁 **Sistema de carpetas**: Organiza documentos en carpetas
- 📝 **Markdown nativo**: Escribe en Markdown con soporte completo
- 🔍 **Búsqueda instantánea**: Usa `⌘K` para buscar rápidamente
- 🎨 **Syntax highlighting**: Resaltado de código para múltiples lenguajes
- 📱 **Responsive**: Funciona en móvil y desktop
- 🌙 **Dark mode**: Soporte para tema oscuro

## 🚀 Inicio rápido

### Requisitos

- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd talkrev-docs

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Uso

### Crear documentos

1. Haz clic en "Nuevo Doc" en la barra lateral
2. Escribe un título y selecciona una carpeta (opcional)
3. El documento se creará con formato Markdown

### Estructura de archivos

Los documentos se almacenan en la carpeta `/docs` como archivos `.md`:

```
docs/
├── getting-started/
│   ├── introduction.md
│   └── quick-start.md
├── api/
│   └── overview.md
└── guides/
    └── style-guide.md
```

### Formato Markdown

Los documentos soportan:

- Títulos (# H1, ## H2, etc.)
- **Negrita** e *itálica*
- Listas ordenadas y desordenadas
- Bloques de código con syntax highlighting
- Tablas
- Citas
- Imágenes
- Links

### Frontmatter

Puedes añadir metadatos al inicio de cada documento:

```markdown
---
title: Mi Documento
author: Tu Nombre
date: 2026-01-15
---

# Contenido aquí...
```

## 🛠️ Desarrollo

### Scripts disponibles

```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Ejecutar build de producción
npm run lint     # Linting
```

### Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **React Markdown** - Renderizado de Markdown
- **Lucide Icons** - Iconos

## 📦 Estructura del proyecto

```
src/
├── app/                 # Páginas y rutas
│   ├── api/            # API routes
│   └── docs/           # Páginas de documentación
├── components/         # Componentes React
│   ├── docs/          # Componentes de documentación
│   └── ui/            # Componentes UI reutilizables
├── lib/               # Utilidades y funciones
└── types/             # Tipos TypeScript
```

## 🤝 Contribuir

1. Crea un documento en `/docs`
2. Usa el formato Markdown estándar
3. Añade frontmatter con título y autor
4. Haz commit y push

## 📄 Licencia

Uso interno - TalkRev © 2026
