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
npm run lint               # Run ESLint with Vue-specific rules
npm run test:ci            # Run lint + unit tests (ALWAYS run before committing)

# Code Generation
npm run new                # Generate new components with Plop templates
                          # Options: view, component, store
                          # Follow prompts for domain/module structure

# Asset Optimization
npm run svgo               # Optimize SVG icons in src/icons/svg/
```

## Important Development Notes

### Before Making Changes
- Always run `npm run test:ci` before committing to ensure code quality
- Use `npm run new` to generate new components following project patterns
- Follow the numerical domain organization (00_common, 10_system, 20_master, etc.)

### Common File Operations
- API files: Located in `src/api/` following domain structure
- View components: Located in `src/views/` mirroring API organization
- Reusable components: Located in `src/components/` organized by function
- Icons: SVG icons in `src/icons/svg/` (optimize with `npm run svgo`)

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

### Component Development Patterns

#### Business Module Structure
Most business modules follow this consistent pattern:
```
views/XX_domain/module_name/
├── index.vue              # Main tab container
├── tabs/
│   ├── 10_list/          # List view with search/filter
│   ├── 20_new/           # Create new records
│   ├── 30_edit/          # Edit existing records  
│   ├── 40_view/          # Read-only detail view
│   ├── 50_approve/       # Approval workflow
│   └── 60_print/         # Print/export functionality
└── dialog/               # Modal dialogs for sub-operations
```

#### Key Component Libraries
- **Element UI**: Primary UI component library (v2.15.14)
- **Custom Components**: Located in `src/components/` organized by function:
  - `00_dict/` - Dictionary/dropdown components
  - `10_file/` - File upload components
  - `30_table/` - Enhanced table components
  - `40_input/` - Custom input components
  - `60_bpm/` - Business process management components

#### API Integration Pattern
```javascript
// Standard API call pattern
import { getListApi, insertApi, updateApi } from '@/api/XX_domain/module_name'

// Usage in component
async loadData() {
  const response = await getListApi(this.queryParams)
  this.tableData = response.data
}
```

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
- **Base URLs**: `/scm` for main API, `/fs` for file operations
- **Development Proxy**: Backend at `http://127.0.0.1:8088/`, File service via `VUE_APP_FILE_UPLOAD_URL`
- **Authentication**: Token-based with automatic refresh, stored in cookies
- **Multi-tenant**: Controlled by `VUE_APP_Tenant` environment variable
  - `false`: Fixed tenant ID `scm_tenant_20250519_001` 
  - `true`: Dynamic tenant handling
- **Error Handling**: Centralized error interceptor with user-friendly Chinese messages
- **Timeout**: 10-minute timeout (600,000ms) for long-running operations

## Common Development Patterns

### Adding a New Business Module
1. Create API service in `src/api/XX_domain/module_name.js`
2. Use `npm run new` to generate view components
3. Follow the tab-based structure (10_list, 20_new, 30_edit, etc.)
4. Add routing configuration (dynamic routes loaded from backend)
5. Implement proper permissions and validation

### Working with Tables
- Use `ExTable` component for enhanced functionality
- Standard pattern: list view with search, pagination, and actions
- Custom table configurations stored in Vuex (`customTableColumns`)

### File Uploads
- Use components from `src/components/10_file/`
- Files uploaded via `/fs` endpoint
- Support for multiple file types and validation

### Code Generation with Plop
The project uses Plop templates for consistent code generation:

```bash
npm run new
# Then select from:
# - view: Generate complete business module with tabs
# - component: Generate reusable Vue component
# - store: Generate Vuex store module
```

**View Generation**: Creates full business module structure:
- Main `index.vue` with tab container
- Standard tabs (10_list, 20_new, 30_edit, 40_view, 50_approve, 60_print)
- Dialog components for sub-operations
- Follows numerical domain organization

**Component Generation**: Creates reusable components with:
- Proper Vue 2.7 structure
- Element UI integration
- Consistent naming conventions

## Troubleshooting

### Development Server Issues
- **Port 19528 in use**: Change port in `vue.config.js` or kill process
- **Proxy errors**: Check backend server at `http://127.0.0.1:8088/`
- **Hot reload not working**: Restart dev server

### Build Issues
- **Memory errors**: Increase Node.js memory with `--max-old-space-size=4096`
- **Asset optimization**: Run `npm run svgo` to optimize SVG icons
- **Environment variables**: Check `.env.staging` and `.env.test1` files

### Common Errors
- **Route not found**: Check dynamic route configuration from backend
- **Permission denied**: Verify user roles and permissions
- **API call failures**: Check network tab, verify token expiration

## Build System and Versioning

### Build Configuration
- **Filename Hashing**: Disabled (uses timestamp for uniqueness)
- **Version System**: Files named as `[name].[VUE_APP_Version].[timestamp].js`
- **Source Maps**: Enabled for production debugging
- **Code Splitting**: Automatic chunking for libs, Element UI, and commons
- **Asset Processing**: Static assets in `/static` directory

### Environment Variables
```bash
# Key environment variables to configure:
VUE_APP_BASE_API=/scm                    # API base path
VUE_APP_FILE_UPLOAD_URL=http://...       # File service URL
VUE_APP_Tenant=false                     # Multi-tenant mode toggle
VUE_APP_Version=1.0.0                    # Version for build files
```

## BPM Integration Details

### Workflow Management
- **Engine**: Flowable-based workflow system
- **Components**: Located in `src/components/60_bpm/`
- **Process Rendering**: Custom Vue components for process visualization
- **User Tasks**: Integrated approval workflows with Chinese UI
- **Process Status**: Real-time status tracking and history

### BPM Development Patterns
- Use `ProcessProgress` component for workflow display
- Custom form rendering with `FormRender` component
- Process submission via `submitBpmDialog` component
- Process design through `designBpmDialog` component

## Testing Configuration

### Jest Setup
- **Config**: `jest.config.js` with Vue support
- **Coverage**: Unit test coverage tracking
- **Mocking**: MockJS for API mocking during tests
- **Clearing Cache**: Auto-cache clearing before test runs

### Pre-commit Hooks
- **Husky**: Pre-commit hook configuration
- **Lint-staged**: Automatic ESLint fixing on staged files
- **Quality Gates**: Must pass `npm run test:ci` before commits

## mysql数据库mcp链接定义
ip：127.0.0.1
port：3306
db:scm_tenant_20250519_001
username:root
password:123456

## Important Notes

### Language and Localization
- This is a Chinese SCM (Supply Chain Management) system
- UI text, comments, and business logic primarily in Chinese
- Component names and API endpoints use English conventions
- Database connections and business rules are configured for Chinese business processes

### Code Quality Standards
- Always run `npm run test:ci` before committing
- Follow Vue.js and Element UI best practices
- Use ESLint configuration provided in the project
- Maintain consistent code formatting and naming conventions

### Critical Development Best Practices

#### Domain Organization
- **Always follow numerical domain structure**: 00_common, 10_system, 20_master, 30_wms, 40_business, 50_query, 90_bpm
- **Mirror API structure**: Views should match API domain organization exactly
- **Use consistent naming**: Chinese business terms with English technical structure

#### Business Module Development
- **Tab Pattern**: All business modules use 6-tab structure (list/new/edit/view/approve/print)
- **Dialog Driven**: Use modal dialogs for sub-operations and related data
- **Permission Based**: Every route and operation respects role-based access control
- **BPM Integration**: Business processes use Flowable workflow engine

#### Chinese Localization Context
- **UI Language**: All user-facing text in Chinese
- **Business Logic**: Designed for Chinese supply chain management processes
- **Data Formats**: Chinese date/number formats and validation rules
- **Workflow Terms**: Approval processes use Chinese business terminology

#### Performance Considerations
- **Lazy Loading**: Routes and components loaded dynamically based on permissions
- **Table Optimization**: Use ExTable for large data sets with virtual scrolling
- **File Handling**: External file service integration for large file operations
- **Caching**: Vuex state management with persistent storage for user preferences
