# Revamply.AI - Admin Panel Implementation Plan

## Phase 1: HTML Restructuring ✓
- Add semantic class names to all text elements
- Follow naming convention: `[element-type]-[section]-[purpose]`
- Example: `.heading-hero-main`, `.paragraph-features-description`

## Phase 2: CSS Modularization ✓
Create 4 new CSS files:
1. `css/theme-dark-desktop.css` - Dark theme for desktop (≥768px)
2. `css/theme-dark-mobile.css` - Dark theme for mobile (<768px)
3. `css/theme-light-desktop.css` - Light theme for desktop
4. `css/theme-light-mobile.css` - Light theme for mobile

CSS Structure:
- CSS variables for colors, fonts, spacing
- Smooth transitions for theme switching
- Modular and maintainable code

## Phase 3: Database Setup ✓
Using Vercel KV (Redis) for:
- User authentication (admin credentials)
- Content storage (all editable elements)
- Session management
- Revision history

## Phase 4: Backend API Endpoints ✓
New API routes in `/api/admin/`:
- `POST /api/admin/login` - Authentication
- `POST /api/admin/logout` - Session cleanup
- `GET /api/admin/verify-session` - Check auth status
- `GET /api/admin/content` - Fetch all content
- `PUT /api/admin/content/:id` - Update content
- `DELETE /api/admin/content/:id` - Delete content
- `POST /api/admin/content` - Create new content
- `GET /api/admin/content/history/:id` - Revision history
- `POST /api/admin/theme` - Switch theme

## Phase 5: Admin Panel UI ✓
Location: `/admin.html`
Features:
- Login page with authentication
- Dashboard with content management
- Inline editing interface
- WYSIWYG editor for text
- Color pickers for colors
- Font controls
- Theme switcher
- Preview mode
- Revision history viewer

## Phase 6: Security Implementation ✓
- Password hashing (bcrypt)
- Session tokens (JWT or secure cookies)
- CSRF protection
- Input sanitization
- Rate limiting on login
- Environment variables for secrets

## Tech Stack
- Frontend: Vanilla JS, Tailwind CSS
- Backend: Vercel Serverless Functions (Node.js)
- Database: Vercel KV (Redis)
- Authentication: JWT with httpOnly cookies
- File Upload: Vercel Blob (for images)

## Environment Variables Needed
```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD_HASH=bcrypt_hashed_password
JWT_SECRET=your_jwt_secret_key
KV_URL=your_vercel_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
```

## Implementation Order
1. ✅ Restructure HTML with semantic classes
2. ✅ Create new CSS files with theme system
3. ✅ Set up content database schema
4. ✅ Build authentication system
5. ✅ Create admin panel UI
6. ✅ Implement content management API
7. ✅ Add inline editing
8. ✅ Implement security measures
9. ✅ Testing and documentation

## Timeline Estimate
- Phase 1-2: HTML/CSS restructuring (2-3 hours)
- Phase 3-4: Backend setup (2-3 hours)
- Phase 5: Admin UI (3-4 hours)
- Phase 6: Security & Testing (2 hours)
- Total: ~10-12 hours of development

Let's begin! 🚀
