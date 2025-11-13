# Codebase Rules and Guidelines

## General Principles

- **Keep it simple**: Focus on clean, maintainable code
- **SQLite-ready**: Mock data structures must match the planned database schema
- **Mobile-first**: Design for mobile devices first, then enhance for desktop
- **Minimalistic UI**: Clean, uncluttered interface using Tailwind CSS

## Code Style

### TypeScript/React

- Use functional components with hooks
- Use TypeScript for type safety
- Use camelCase for variables and functions
- Use PascalCase for component names
- Prefer const over let, avoid var
- Use arrow functions for callbacks
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks or utility functions
- Use proper TypeScript types and interfaces

### File Organization

- Components in `components/` organized by feature or type
- Pages in `app/` using Next.js App Router
- Utilities in `lib/`
- Mock data in `lib/`
- Use index files for cleaner imports when appropriate

### Naming Conventions

- Component files: PascalCase (e.g., `TransactionForm.tsx`)
- Utility files: camelCase (e.g., `portfolioUtils.ts`)
- Hook files: camelCase starting with "use" (e.g., `usePortfolio.ts`)
- Type files: Use `.ts` extension with descriptive names

## Next.js Specific

- Use App Router (not Pages Router)
- Use `'use client'` directive for client components
- Use Server Components by default (no directive needed)
- Use `next/link` for navigation
- Use `next/image` for images
- Use `next/font` for font optimization
- Keep server components minimal, move interactivity to client components

## State Management

- Use React Context API for global state (when needed)
- Use local state (useState) for component-specific state
- Keep state as close to where it's used as possible
- Avoid prop drilling - use Context when needed
- Use useMemo and useCallback for performance optimization when appropriate

## Data Handling

- Mock data structure must match SQLite schema exactly
- Use consistent date formats (ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`)
- All monetary values in decimal format (e.g., `2500.00`)
- Use Indian number formatting (lakhs/crores) for display
- Use UTC dates for consistent server/client rendering

## Component Guidelines

### Form Components

- Use controlled components with useState
- Validate inputs on submit and on blur
- Show clear error messages
- Use proper input types (number, date, etc.)
- Use proper form semantics

### Display Components

- Show loading states while data is being fetched
- Show empty states when no data is available
- Use consistent color coding (green for gains, red for losses)
- Format numbers consistently (currency, percentages)
- Use Fragment with keys when mapping multiple elements

### Table Components

- Use proper table semantics
- Ensure horizontal scrolling works on mobile
- Use expandable rows for nested data
- Provide proper keys for all mapped elements

## Styling

- Use Tailwind CSS utility classes
- Avoid custom CSS unless absolutely necessary
- Use Tailwind's responsive breakpoints
- Maintain consistent spacing using Tailwind's spacing scale
- Use semantic color names (e.g., `text-emerald-600` for gains, `text-rose-600` for losses)
- Ensure no horizontal overflow (use `overflow-x-hidden` on root elements)

## Performance

- Use React.memo for expensive components when needed
- Use useMemo for expensive calculations
- Use useCallback for stable function references
- Optimize images using Next.js Image component
- Avoid unnecessary re-renders
- Use proper key props in lists

## Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast
- Test with screen readers when possible

## Indian Market Specifics

- Support NSE and BSE stock symbols
- Use Indian currency symbol (₹)
- Format large numbers using lakhs/crores notation
- Consider Indian tax implications (STCG/LTCG) in calculations
- Use Indian date/time formats for display

## Package Management

### Frontend
- Use Bun for package management (faster and more reliable)
- Use `bun install` instead of `npm install`
- Use `bun run` for scripts

### Backend
- Use Conda for Python virtual environment management
- Create environment: `conda create -n StockThing python=3.12.0 -y`
- Activate environment: `conda activate StockThing`
- Install dependencies: `pip install -r backend/requirements.txt`
- Do not specify versions in requirements.txt (let pip resolve compatible versions)

## Deployment

- Use GitHub Actions for CI/CD
- Deploy to Oracle Cloud Ubuntu server
- **Frontend**: Next.js app on port 3001 (default), uses PM2 for process management (with nohup/systemd fallback)
- **Backend**: Flask API with Gunicorn on port 5000 (default), uses nohup for process management
- Both services bind to 0.0.0.0 for external access
- Frontend builds on server after copying source files
- Backend uses Conda environment (`StockThing`) with Python 3.12.0
- Next.js rewrites proxy `/api/*` to backend (configured via `BACKEND_URL` env var)
- See `DEPLOYMENT.md` for detailed deployment instructions

## Testing Considerations

- Write components that are easy to test
- Keep business logic separate from UI components
- Use mock data for development and testing
- Test in browser for visual verification

## Backend Integration (Completed)

- ✅ All API calls follow REST conventions
- ✅ API logic separated into `lib/api.ts` client
- ✅ Loading and error states implemented consistently
- ✅ Data structures match between frontend and backend
- ✅ All mock data replaced with API calls
- ✅ Real-time stock prices from yfinance
- ✅ Stock search uses exact symbol matching with capitalization normalization
- ✅ Portfolio calculations use real-time prices
- ✅ Capital gains use FIFO matching from backend

## Production Deployment (Completed)

- ✅ **Backend Deployment**: Flask API deployed with Gunicorn (3 workers) on port 5000
- ✅ **Frontend Deployment**: Next.js app deployed with PM2/systemd on port 3001
- ✅ **HTTPS/API Connectivity**: Next.js rewrites in `next.config.ts` proxy `/api/*` to backend
- ✅ **Mixed Content Fix**: Frontend uses relative URLs (`/api`) which are proxied server-side
- ✅ **Environment Configuration**: `BACKEND_URL` set during deployment for Next.js rewrites
- ✅ **CORS Configuration**: Backend CORS includes HTTPS domain and internal IPs
- ✅ **Full-Stack Integration**: All features tested and working in production
- ✅ **Live Site**: https://stockthing.vanshraja.me

### API Proxying Architecture

The frontend uses relative URLs (`/api/*`) to avoid mixed content issues. Next.js rewrites configured in `next.config.ts` proxy these requests to the backend:

```typescript
// frontend/next.config.ts
async rewrites() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

This ensures:
- Browser only sees HTTPS requests (no mixed content)
- API requests go through same domain
- Backend accessible only via Next.js proxy (security)
- Works seamlessly with Cloudflare Tunnel

## Git Workflow

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Use feature branches for new features
- Don't commit sensitive data or API keys
- Follow conventional commit format when possible

## Error Handling

- Handle hydration errors (use consistent date formatting)
- Avoid Math.random() in render (causes hydration mismatches)
- Use proper error boundaries for production
- Show user-friendly error messages

## Portfolio Views

- **Scrip View**: Group by stock, show account breakdown when expanded
  - Sell button pre-fills stock when clicked from main row
  - Sell button pre-fills stock, account, and quantity when clicked from expanded account row
- **Head View**: Group by account, show stock breakdown when expanded
  - Sell button pre-fills stock, account, and quantity when clicked from expanded stock row
- **Date View**: Show all purchase transactions sorted by purchase date
  - Sort toggle (ascending/descending) for date ordering
  - Sell button pre-fills stock, account, and quantity based on transaction row
  - Displays remaining quantity (after any sells) instead of separate purchase/remaining columns
- All three views are toggleable
- Use expandable/collapsible rows for nested data (Scrip and Head views)
- Ensure proper key props for all mapped elements
- Actions column (Sell and More buttons) present in all views

## Sell Share Modal

- **Pre-filling Logic**: Modal automatically pre-fills account and quantity based on context:
  - Scrip View main row: Pre-fills stock only
  - Scrip View expanded account row: Pre-fills stock, account, and quantity
  - Head View expanded stock row: Pre-fills stock, account, and quantity
  - Date View transaction row: Pre-fills stock, account, and quantity
- **Modal Overlay**: Use `bg-gray-500 bg-opacity-30` for transparent overlay (30% opacity)
- **Current Price**: Automatically fetched and pre-filled from yfinance
- **Account Selection**: Shows available shares per account in dropdown

## Filtering

- Search by stock symbol or name
- Filter by account
- Clear Filters button appears when filters are active
- Filters apply to all portfolio views (Scrip, Head, Date)

# Specific instructions by user:
- Do not commit and push to github without the users explicit permission.