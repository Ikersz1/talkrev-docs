# TalkRev Docs

Internal documentation platform for the TalkRev team.

## ✨ Features

- 📁 **Folder System**: Organize documents in folders and subfolders
- 📝 **Markdown Support**: Write in Markdown with full support
- 📄 **Multi-file Support**: Upload and view PDFs, images, videos, and more
- 🤖 **AI Chatbot**: Ask questions about your documentation using OpenRouter
- 🔍 **Instant Search**: Use `⌘K` to search quickly
- 🎨 **Syntax Highlighting**: Code highlighting for multiple languages
- 📱 **Responsive**: Works on mobile and desktop
- 🌙 **Dark Mode**: Dark theme support

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm or pnpm
- Supabase account (for database and storage)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd talkrev-docs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run in development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment (Vercel)

### Prerequisites

1. A [Vercel account](https://vercel.com)
2. Your Supabase project URL and anon key
3. Your OpenRouter API key

### Deploy Steps

1. **Push your code to GitHub** (already done ✅)

2. **Import project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import the `talkrev-docs` repository

3. **Configure Environment Variables:**
   In the Vercel project settings, add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `OPENROUTER_API_KEY` - Your OpenRouter API key
   - `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., `https://talkrev-docs.vercel.app`)

4. **Deploy:**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your app will be live in minutes!

### Post-Deployment

After deployment, update `NEXT_PUBLIC_APP_URL` in Vercel with your actual deployment URL for the OpenRouter referer header.

## 📖 Usage

### Creating Documents

1. Click "New Doc" in the sidebar
2. Enter a title and select a folder (optional)
3. The document will be created with Markdown format

### Uploading Files

1. Click "Upload Files" in the sidebar
2. Select any file type (PDF, images, videos, etc.)
3. PDFs will have their text automatically extracted for the AI chatbot

### AI Chatbot

1. Click the chat icon in the bottom right
2. Select context: "All documentation", a specific folder, or a specific document
3. Ask questions about your documentation
4. The chatbot uses OpenRouter with Google Gemini 3 Flash Preview

### Markdown Format

Documents support:

- Headers (# H1, ## H2, etc.)
- **Bold** and *italic* text
- Ordered and unordered lists
- Code blocks with syntax highlighting
- Tables
- Blockquotes
- Images
- Links

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Development with hot reload
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Linting
```

### Technologies

- **Next.js 16** - React Framework
- **TypeScript** - Static typing
- **Tailwind CSS 4** - Styling
- **Supabase** - Database and Storage
- **OpenRouter** - LLM API
- **React Markdown** - Markdown rendering
- **pdf-parse** - PDF text extraction
- **Lucide Icons** - Icons

## 📦 Project Structure

```
src/
├── app/                 # Pages and routes
│   ├── api/            # API routes
│   │   ├── chat/       # AI chatbot endpoint
│   │   ├── docs/       # Document management
│   │   └── search/     # Search endpoint
│   └── docs/           # Documentation pages
├── components/         # React components
│   ├── docs/          # Documentation components
│   └── ui/            # Reusable UI components
├── lib/               # Utilities and functions
│   └── supabase/      # Supabase client and queries
└── types/             # TypeScript types
```

## 🤝 Contributing

1. Create a document or make changes
2. Use standard Markdown format
3. Commit and push your changes

## 📄 License

Internal use - TalkRev © 2026
