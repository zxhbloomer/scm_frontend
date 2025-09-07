/**
 * 报表系统路由配置
 * @description JimuReport集成SCM系统的路由配置
 */
import Layout from '@/layout'

const reportRouter = {
  path: '/report',
  component: Layout,
  redirect: '/report/management/report-list',
  name: 'Report',
  meta: {
    title: '报表中心',
    icon: 'chart',
    roles: ['admin', 'report_user'], // 权限控制
    noCache: false
  },
  children: [
    // 报表管理模块
    {
      path: 'management',
      component: () => import('@/views/80_report/management'),
      name: 'ReportManagement',
      meta: { title: '报表管理', icon: 'document' },
      redirect: '/report/management/report-list',
      children: [
        {
          path: 'report-list',
          name: 'ReportList',
          component: () => import('@/views/80_report/management/report-list/index.vue'),
          meta: {
            title: '报表列表',
            icon: 'table',
            page_code: 'report_list',
            keepAlive: true,
            roles: ['admin', 'report_user']
          }
        },
        {
          path: 'report-list/create',
          name: 'ReportCreate',
          component: () => import('@/views/80_report/management/report-list/create.vue'),
          meta: {
            title: '新建报表',
            icon: 'edit',
            page_code: 'report_create',
            activeMenu: '/report/management/report-list',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'report-list/edit/:id',
          name: 'ReportEdit',
          component: () => import('@/views/80_report/management/report-list/edit.vue'),
          meta: {
            title: '编辑报表',
            icon: 'edit',
            page_code: 'report_edit',
            activeMenu: '/report/management/report-list',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'report-list/view/:id',
          name: 'ReportView',
          component: () => import('@/views/80_report/management/report-list/view.vue'),
          meta: {
            title: '查看报表',
            icon: 'view',
            page_code: 'report_view',
            activeMenu: '/report/management/report-list',
            roles: ['admin', 'report_user']
          },
          hidden: true
        },
        {
          path: 'permission',
          name: 'ReportPermission',
          component: () => import('@/views/80_report/management/permission/index.vue'),
          meta: {
            title: '权限管理',
            icon: 'permission',
            page_code: 'report_permission',
            roles: ['admin']
          }
        },
        {
          path: 'permission/assign/:id',
          name: 'ReportPermissionAssign',
          component: () => import('@/views/80_report/management/permission/assign.vue'),
          meta: {
            title: '权限分配',
            icon: 'permission',
            page_code: 'report_permission_assign',
            activeMenu: '/report/management/permission',
            roles: ['admin']
          },
          hidden: true
        },
        {
          path: 'system',
          name: 'ReportSystem',
          component: () => import('@/views/80_report/management/system/config.vue'),
          meta: {
            title: '系统配置',
            icon: 'setting',
            page_code: 'report_system',
            roles: ['admin']
          }
        }
      ]
    },

    // 报表设计模块
    {
      path: 'design',
      component: () => import('@/views/80_report/design'),
      name: 'ReportDesign',
      meta: { title: '报表设计', icon: 'edit' },
      redirect: '/report/design/designer',
      children: [
        {
          path: 'designer',
          name: 'ReportDesigner',
          component: () => import('@/views/80_report/design/designer/index.vue'),
          meta: {
            title: '报表设计器',
            icon: 'edit',
            page_code: 'report_designer',
            keepAlive: true,
            roles: ['admin', 'report_manager']
          }
        },
        {
          path: 'designer/:id',
          name: 'ReportDesignerEdit',
          component: () => import('@/views/80_report/design/designer/index.vue'),
          meta: {
            title: '编辑报表设计',
            icon: 'edit',
            page_code: 'report_designer_edit',
            activeMenu: '/report/design/designer',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'datasource',
          name: 'ReportDataSource',
          component: () => import('@/views/80_report/design/datasource/index.vue'),
          meta: {
            title: '数据源管理',
            icon: 'database',
            page_code: 'report_datasource',
            keepAlive: true,
            roles: ['admin', 'report_manager']
          }
        },
        {
          path: 'datasource/create',
          name: 'ReportDataSourceCreate',
          component: () => import('@/views/80_report/design/datasource/create.vue'),
          meta: {
            title: '新建数据源',
            icon: 'edit',
            page_code: 'report_datasource_create',
            activeMenu: '/report/design/datasource',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'template',
          name: 'ReportTemplate',
          component: () => import('@/views/80_report/design/template/index.vue'),
          meta: {
            title: '模板管理',
            icon: 'template',
            page_code: 'report_template',
            keepAlive: true,
            roles: ['admin', 'report_manager']
          }
        },
        {
          path: 'template/preview/:id',
          name: 'ReportTemplatePreview',
          component: () => import('@/views/80_report/design/template/preview.vue'),
          meta: {
            title: '模板预览',
            icon: 'view',
            page_code: 'report_template_preview',
            activeMenu: '/report/design/template',
            roles: ['admin', 'report_user']
          },
          hidden: true
        }
      ]
    },

    // BI大屏模块
    {
      path: 'bi',
      component: () => import('@/views/80_report/bi'),
      name: 'ReportBI',
      meta: { title: 'BI大屏', icon: 'monitor' },
      redirect: '/report/bi/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'ReportDashboard',
          component: () => import('@/views/80_report/bi/dashboard/index.vue'),
          meta: {
            title: '仪表板',
            icon: 'dashboard',
            page_code: 'report_dashboard',
            keepAlive: true,
            roles: ['admin', 'report_user']
          }
        },
        {
          path: 'dashboard/designer',
          name: 'ReportDashboardDesigner',
          component: () => import('@/views/80_report/bi/dashboard/designer.vue'),
          meta: {
            title: '大屏设计器',
            icon: 'edit',
            page_code: 'report_dashboard_designer',
            activeMenu: '/report/bi/dashboard',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'dashboard/preview/:id',
          name: 'ReportDashboardPreview',
          component: () => import('@/views/80_report/bi/dashboard/preview.vue'),
          meta: {
            title: '大屏预览',
            icon: 'view',
            page_code: 'report_dashboard_preview',
            activeMenu: '/report/bi/dashboard',
            roles: ['admin', 'report_user']
          },
          hidden: true
        },
        {
          path: 'charts',
          name: 'ReportCharts',
          component: () => import('@/views/80_report/bi/charts/index.vue'),
          meta: {
            title: '图表管理',
            icon: 'chart',
            page_code: 'report_charts',
            keepAlive: true,
            roles: ['admin', 'report_manager']
          }
        },
        {
          path: 'charts/create',
          name: 'ReportChartsCreate',
          component: () => import('@/views/80_report/bi/charts/create.vue'),
          meta: {
            title: '创建图表',
            icon: 'edit',
            page_code: 'report_charts_create',
            activeMenu: '/report/bi/charts',
            roles: ['admin', 'report_manager']
          },
          hidden: true
        },
        {
          path: 'screen',
          name: 'ReportScreen',
          component: () => import('@/views/80_report/bi/screen/fullscreen.vue'),
          meta: {
            title: '大屏展示',
            icon: 'fullscreen',
            page_code: 'report_screen',
            roles: ['admin', 'report_user']
          }
        }
      ]
    },

    // 报表预览（独立路由）
    {
      path: 'preview/:id',
      name: 'ReportPreview',
      component: () => import('@/views/80_report/preview/index.vue'),
      meta: {
        title: '报表预览',
        icon: 'view',
        page_code: 'report_preview',
        roles: ['admin', 'report_user']
      },
      hidden: true
    },

    // 报表打印（独立路由）
    {
      path: 'print/:id',
      name: 'ReportPrint',
      component: () => import('@/views/80_report/print/index.vue'),
      meta: {
        title: '报表打印',
        icon: 'print',
        page_code: 'report_print',
        roles: ['admin', 'report_user']
      },
      hidden: true
    }
  ]
}

export default reportRouter
