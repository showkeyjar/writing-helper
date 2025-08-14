# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
```bash
npm run dev          # Start development server with Turbopack
```

### Build & Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
```

## Core Architecture

This is a Next.js 15 AI writing assistant with TypeScript and Tailwind CSS. The application helps users generate content using various LLM APIs.

### Key Components Structure

- **API Proxy Layer** (`src/app/api/proxy/route.ts`): Central proxy that handles requests to multiple LLM providers (OpenAI, Grok, Ollama, DeepSeek) with CORS handling and 10-minute timeout support
- **Core Types** (`src/app/lib/types.ts`): Defines `PromptStyle`, `WritingRequest`, `PolishRequest` interfaces for the writing system
- **API Client** (`src/app/lib/api.ts`): Main logic for content generation and polishing with multi-provider support
- **Feature Pages**: Modular features under `src/app/features/` including AI rewrite, text summarizer, and WeChat formatter

### LLM Provider Support

The application handles multiple LLM APIs through a unified proxy:
- **OpenAI**: Standard chat completions format
- **Grok (xAI)**: Uses `grok-3-latest` model 
- **Ollama**: Local models with `/api/generate` endpoint
- **DeepSeek**: OpenAI-compatible with DeepSeek models

### Key Features

1. **Writing Assistant**: Generates content based on detailed style prompts with 8 style dimensions (language, structure, narrative, emotion, thinking, uniqueness, cultural, rhythm)
2. **AI Text Optimizer**: Removes AI characteristics from generated text
3. **WeChat Formatter**: Formats content for WeChat publishing
4. **Article Polisher**: Refines existing content with different polish types

## Important Development Notes

### API Request Flow
All LLM requests go through `/api/proxy` to handle CORS and different provider formats. The proxy automatically detects provider type from URL and formats requests appropriately.

### Error Handling
The proxy includes comprehensive error handling for timeouts (10min), connection failures, and API errors with user-friendly messages.

### Cherry Studio Detection
The app includes client-side detection for Cherry Studio environment and adjusts UI accordingly (`layout.tsx:30-51`).

### Content Extraction
Multi-format content extraction from different API responses with fallback strategies for various response structures.

## Configuration Files

- `next.config.mjs`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration  
- `eslint.config.mjs`: ESLint configuration
- `tsconfig.json`: TypeScript configuration
- `.cursor/rules/next.mdc`: Cursor editor rules for Next.js development

## Package Manager
Uses Yarn 4.6.0 as specified in package.json packageManager field.