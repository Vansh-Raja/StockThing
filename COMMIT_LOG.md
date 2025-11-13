# Commit Log

This file tracks what features and changes are included in each commit/deployment.

## Latest Commit

**Date**: 2025-11-13  
**Commit**: 8dc5b56  
**Status**: ✅ Deployed successfully

### Changes in this commit:
- Redesigned SummaryCards component with balanced layout and subtle left border accents
- Removed decorative gradient icons and fixed alignment issues
- Removed day change percentage column from portfolio table (backend implementation preserved for future use)
- Implemented sell shares functionality with modal-based interface
- Added sell button and three-dot menu button to portfolio table
- Created SellShareModal component for selling shares from portfolio
- Updated documentation (plan.md, README.md, AGENTS.md) to reflect all changes
- Added deployment pipeline and commit log tracking to .cursorrules

### Files Changed:
- `.cursorrules` - Added deployment pipeline and commit log tracking
- `plan.md` - Updated with summary cards redesign and sell feature
- `README.md` - Updated features section
- `AGENTS.md` - Updated if needed
- `frontend/components/SummaryCards.tsx` - Complete redesign
- `frontend/components/PortfolioTable.tsx` - Added sell buttons, removed day change column
- `frontend/components/SellShareModal.tsx` - New component for selling shares
- `frontend/components/PortfolioPage.tsx` - Updated to support sell functionality
- `backend/app/services/stock_service.py` - Added day change calculation (backend only)
- `backend/app/services/portfolio_service.py` - Added day change to API responses

---

## Previous Commits

(Previous commits will be archived here after new commits are made)

