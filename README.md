# AI Researcher

A web application that generates IEEE-formatted research papers using AI.

## Features

- 🤖 AI-powered research paper generation
- 📄 IEEE format compliance
- 📊 Adjustable word count (500-3000 words)
- 💾 Export to PDF or DOCX
- 🎨 Clean, modern UI

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- PDFKit (PDF export)
- docx (DOCX export)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter a research topic or question
2. Select desired word count
3. Click "Generate Paper"
4. Preview the generated IEEE paper
5. Export as PDF or DOCX

## Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── api/
│   │   └── research/
│   │       ├── route.ts          # Paper generation API
│   │       └── export/
│   │           └── route.ts      # Export API (PDF/DOCX)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # React components
│   ├── ResearchForm.tsx
│   └── PaperPreview.tsx
├── types/               # TypeScript types
│   └── paper.ts
└── lib/                 # Utility functions
```

## License

MIT
