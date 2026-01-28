# Next.js Frontend

This is the Next.js frontend for the Fullstack NNP Template.

## Features

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS for styling
- Type-safe API client
- ESLint and Prettier for code quality

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Configure your `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

4. Start the development server:
```bash
yarn dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Lint code
- `yarn format` - Format code with Prettier

## Project Structure

```
app/
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Home page

components/             # React components
├── ui/                # UI components
└── forms/             # Form components

lib/
├── api.ts             # API client
└── utils.ts           # Utility functions

public/                # Static assets
```

## API Client

The API client is located in `lib/api.ts` and provides type-safe methods for interacting with the backend:

```typescript
import { apiClient } from '@/lib/api';

// Fetch users
const users = await apiClient.getUsers();

// Create user
const newUser = await apiClient.createUser({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
});

// Update user
const updatedUser = await apiClient.updateUser(userId, {
  firstName: 'Jane',
});

// Delete user
await apiClient.deleteUser(userId);
```

## Server vs Client Components

- **Use Server Components by default** - They're faster and more efficient
- **Use Client Components when you need:**
  - Interactivity (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - React hooks (useState, useEffect, etc.)
  - Third-party libraries that use browser APIs

```typescript
// Server Component (default)
export default async function UsersPage() {
  const users = await apiClient.getUsers();
  return <div>...</div>;
}

// Client Component
'use client';

export default function UserForm() {
  const [name, setName] = useState('');
  return <form>...</form>;
}
```

## Styling with Tailwind CSS

This template uses Tailwind CSS v4:

```tsx
export default function Button() {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Click me
    </button>
  );
}
```

## Environment Variables

Environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Usage:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

