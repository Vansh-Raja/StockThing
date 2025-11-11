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

- Use Bun for package management (faster and more reliable)
- Use `bun install` instead of `npm install`
- Use `bun run` for scripts

## Deployment

- Use GitHub Actions for CI/CD
- Deploy to Oracle Cloud Ubuntu server
- Use PM2 for process management
- See `DEPLOYMENT.md` for detailed deployment instructions

## Testing Considerations

- Write components that are easy to test
- Keep business logic separate from UI components
- Use mock data for development and testing
- Test in browser for visual verification

## Future Backend Integration

- Design API calls to match REST conventions
- Keep API logic separate from components (use custom hooks or services)
- Handle loading and error states consistently
- Use consistent data structures between frontend and backend
- Replace mock data with API calls when backend is ready

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
- **Head View**: Group by account, show stock breakdown when expanded
- Both views should be toggleable
- Use expandable/collapsible rows for nested data
- Ensure proper key props for all mapped elements
