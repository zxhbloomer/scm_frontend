# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev                 # Start development server on port 19528

# Build
npm run build:stage        # Build for staging environment
npm run build:test1        # Build for test1 environment

# Testing & Code Quality
npm run test:unit          # Run unit tests with Jest
npm run lint               # Run ESLint
npm run test:ci            # Run lint + unit tests (use before committing)

# Utilities
npm run new                # Generate new components with Plop templates
npm run svgo               # Optimize SVG icons
```

## Project Architecture

This is a **Vue.js 2.7.16 enterprise warehouse management system (WMS)** with Element UI, using a sophisticated domain-driven architecture.

### Technology Stack
- **Frontend**: Vue.js 2.7.16 + Element UI 2.15.14
- **State Management**: Vuex 3.1.0
- **Routing**: Vue Router 3.1.3 (dynamic, permission-based)
- **HTTP**: Axios 0.19.0
- **Build**: Vue CLI 4.4.4

### Code Organization

The codebase uses **numerical domain organization** across API, views, and business logic:

```
src/
├── api/          # API services organized by domain
│   ├── 00_common/    # Common utilities (CORS, table config)
│   ├── 00_platform/  # Platform services (auth, system codes)
│   ├── 10_system/    # System management (logs, roles, permissions)
│   ├── 20_master/    # Master data (companies, staff, organizations)
│   ├── 30_wms/       # Warehouse management (goods, locations, vehicles)
│   ├── 40_business/  # Business operations (inbound/outbound, logistics)
│   ├── 50_query/     # Query and reporting
│   └── 90_bpm/       # Business Process Management
├── views/        # Vue components mirroring API structure
└── components/   # Reusable components organized by function
```

### Key Architectural Patterns

1. **Tab-based Business Interfaces**: Most business modules follow a consistent tab pattern:
   - `10_list/` - Data listing and search
   - `20_new/` - Create new records
   - `30_edit/` - Edit existing records
   - `40_view/` - Read-only detail view
   - `50_approve/` - Approval workflow
   - `60_print/` - Print/export functionality

2. **Dialog-driven UI**: Extensive use of modal dialogs for forms and details

3. **Dynamic Routing**: Routes and menus loaded based on user permissions from backend

4. **Multi-tenant Architecture**: Configurable via `VUE_APP_Tenant` environment variable

### State Management (Vuex Modules)
- `user` - Authentication and user session
- `permission` - Menu permissions and role-based access
- `bpm` - Business process management
- `headNotice` - Notifications and alerts
- `customTableColumns` - Dynamic table configurations

### Development Workflow

1. **API Development**: Follow the numerical domain pattern when adding new endpoints
2. **Component Creation**: Use `npm run new` with Plop for consistent structure
3. **Business Forms**: Most business operations use the tab-based pattern with dialog components
4. **Permissions**: All routes and components respect role-based access control
5. **File Operations**: Use `/fs` API endpoint for file uploads/downloads

### Critical Configuration Files
- `vue.config.js` - Development server (port 19528) and build configuration
- `src/permission.js` - Route guards and authentication logic
- `src/utils/request.js` - HTTP client with interceptors
- `src/settings.js` - Application themes and settings

### Testing and Quality
- Always run `npm run test:ci` before committing (runs lint + tests)
- Unit tests using Jest for business logic
- ESLint with Vue-specific rules for code quality
- Pre-commit hooks ensure code standards

### API Communication
- Base URLs: `/scm` for main API, `/fs` for file operations
- Development proxy: `http://127.0.0.1:8088/`
- Token-based authentication with automatic refresh
- Centralized error handling with user-friendly messages

## mysql数据库mcp链接定义
ip：127.0.0.1
port：3306
db:scm_tenant_20250519_001
username:root
password:123456

# 项目开发时的规则说明
- @~/.claude/vue-rule-1.md
- @~/.claude/scm-components-quick-reference.instructions.md
- @~/.claude/scm-custom-components.instructions.md
- @~/.claude/scm-input-components.instructions.md
- @~/.claude/scm-quick-reference.instructions.md