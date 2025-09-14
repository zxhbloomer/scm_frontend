# 规格管理页面导出功能完整设计方案

## 设计概述
完全复制仓库管理页面的导出逻辑到规格管理页面，确保5个关键方面的一致性：
1. 按钮逻辑 - 单按钮切换到三按钮模式
2. 多选框逻辑 - 导出模式下显示checkbox列
3. 后台SQL查询逻辑 - 特别是动态排序机制
4. URL一致性 - exportall和export两个端点
5. 导出VO类 - 列与页面显示完全匹配

## 文件修改设计详情

### 1. 前端页面修改：src/views/30_wms/spec/page/10_list/index.vue

#### 1.1 Data数据结构增加导出相关属性
```javascript
settings: {
  exportModel: false,  // 导出模式开关，控制checkbox列显示
  btnShowStatus: {
    hidenExport: true  // 按钮显示状态：true=单导出按钮，false=三按钮模式
  }
}
```

#### 1.2 Table结构修改
- 在第一列增加多选checkbox列，v-if="settings.exportModel"控制显示
- 确保selection-change事件绑定到handleSelectionChange方法

#### 1.3 按钮区域修改
- 默认显示：单个"导出"按钮（hidenExport: true时）
- 导出模式：三个按钮 - "导出所选"、"导出全部"、"退出导出模式"（hidenExport: false时）
- 按钮权限与仓库管理保持一致

#### 1.4 Methods方法增加
```javascript
// 进入导出模式
handleModelOpen() {
  this.settings.exportModel = true
  this.settings.btnShowStatus.hidenExport = false
  this.multipleSelection = []
  this.$tours['myTour'].start()  // 启动用户引导
}

// 退出导出模式  
handleModelClose() {
  this.settings.exportModel = false
  this.settings.btnShowStatus.hidenExport = true
  this.multipleSelection = []
}

// 导出全部数据
handleExportAllData() {
  exportAllApi(this.dataJson.searchForm).then(response => {
    // 文件下载处理逻辑
  })
}

// 导出选中数据
handleExportSelectionData() {
  if (this.dataJson.multipleSelection.length === 0) {
    this.$message.warning('请选择要导出的记录')
    return
  }
  const selectionIds = this.dataJson.multipleSelection.map(item => item.id)
  exportSelectionApi({ ids: selectionIds }).then(response => {
    // 文件下载处理逻辑
  })
}
```

#### 1.5 Vue Tours配置
- 复制仓库管理的导出模式引导配置
- 引导用户了解多选导出流程

### 2. 前端API修改：src/api/30_wms/spec/spec.js

#### 2.1 新增导出API方法
```javascript
/**
 * 导出数据 全部导出
 * @param {*} data
 */
export function exportAllApi (data) {
  return request({
    url: '/api/v1/goodsspec/exportall',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出数据 选中导出  
 * @param {*} data
 */
export function exportSelectionApi (data) {
  return request({
    url: '/api/v1/goodsspec/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}
```

#### 2.2 URL路径说明
- 全部导出：/api/v1/goodsspec/exportall
- 选中导出：/api/v1/goodsspec/export
- 与现有exportApi重名冲突处理：将现有exportApi重命名为exportOldApi（向后兼容）

### 3. 后端Controller修改：MGoodsSpecController.java

#### 3.1 新增两个导出方法
完全复制MWarehouseController的导出模式：

```java
@SysLogAnnotion("规格信息导出")
@PostMapping("/exportall") 
public void exportAll(@RequestBody(required = false) MGoodsSpecVo searchCondition, HttpServletResponse response) throws IOException {
    // 通过页面编码获取完整的页面对象
    SPagesVo sPagesVo = sPagesMapper.selectByCode(PageCodeConstant.PAGE_GOODS_SPEC);
    
    try {
        // 设置导出处理状态为true
        sPagesService.updateExportProcessingTrue(sPagesVo);
        
        // 全部导出：直接调用selectExportList查询方法
        List<MGoodsSpecExportVo> exportDataList = service.selectExportList(searchCondition);
        log.info("全部导出：查询到规格数据 {} 条", exportDataList.size());
        
        EasyExcelUtil<MGoodsSpecExportVo> util = new EasyExcelUtil<>(MGoodsSpecExportVo.class);
        String fileName = "规格信息导出_" + DateTimeUtil.dateTimeNow();
        util.exportExcel(fileName, "规格信息", exportDataList, response);
    } finally {
        // 无论成功失败都要恢复导出处理状态为false
        sPagesService.updateExportProcessingFalse(sPagesVo);
    }
}

@SysLogAnnotion("规格信息导出")
@PostMapping("/export")
public void export(@RequestBody(required = false) MGoodsSpecVo searchCondition, HttpServletResponse response) throws IOException {
    // 选中导出逻辑，包含ids参数验证
    if (searchCondition == null || searchCondition.getIds() == null || searchCondition.getIds().length == 0) {
        throw new BusinessException("请选择要导出的规格记录");
    }
    
    // 其余逻辑与exportAll相同
}
```

#### 3.2 PageCodeConstant常量
需要确认或新增PAGE_GOODS_SPEC常量定义

### 4. 后端Service修改：IMGoodsSpecService接口和实现类

#### 4.1 Service接口新增方法
```java
/**
 * 查询导出列表数据（支持动态排序）
 * @param searchCondition 搜索条件
 * @return 导出VO列表
 */
List<MGoodsSpecExportVo> selectExportList(MGoodsSpecVo searchCondition);
```

#### 4.2 Service实现类
```java
@Override
public List<MGoodsSpecExportVo> selectExportList(MGoodsSpecVo searchCondition) {
    // 构建排序子句（这是关键的特殊逻辑）
    String orderByClause = buildOrderByClause(searchCondition);
    return mapper.selectExportList(searchCondition, orderByClause);
}

private String buildOrderByClause(MGoodsSpecVo searchCondition) {
    // 复制仓库管理的排序逻辑
    // 如果前端传入排序参数，构建对应的ORDER BY子句
    // 默认按更新时间倒序
    return " ORDER BY t1.u_time DESC";
}
```

### 5. 后端Mapper修改：MGoodsSpecMapper.java（关键的SQL排序逻辑）

#### 5.1 新增selectExportList方法（核心特殊逻辑）
```java
String selectExportList_select = """
    SELECT 
    (@row_num := @row_num + 1) as no,
    t1.code,
    t1.name, 
    t1.short_name,
    t1.goods_name,
    t1.unit_name,
    t1.spec_model,
    t1.brand_name,
    -- 其他需要导出的字段
    CASE WHEN t1.enable_status = '1' THEN '启用' ELSE '停用' END as enable_status,
    su1.name as c_name,
    t1.c_time,
    su2.name as u_name, 
    t1.u_time
    FROM m_goods_spec t1
    CROSS JOIN (SELECT @row_num := 0) r
    LEFT JOIN sys_user su1 ON t1.c_id = su1.id
    LEFT JOIN sys_user su2 ON t1.u_id = su2.id
    WHERE t1.delete_status = '0'
    """;

@Select({
    "<script>"
    + selectExportList_select
    + "<!-- 动态查询条件 -->"
    + "<if test='p1.name != null and p1.name != \"\"'>"
    + "  and t1.name like CONCAT('%', #{p1.name}, '%')"
    + "</if>"
    + "<if test='p1.goods_id != null'>"
    + "  and t1.goods_id = #{p1.goods_id}"
    + "</if>"
    + "<if test='p1.enable_status != null and p1.enable_status != \"\"'>"
    + "  and t1.enable_status = #{p1.enable_status}"
    + "</if>"
    + "<!-- 选中导出ID条件 -->"
    + "<if test='p1.ids != null and p1.ids.length != 0'>"
    + "  and t1.id in"
    + "  <foreach collection='p1.ids' item='item' open='(' separator=',' close=')'>"
    + "    #{item}"
    + "  </foreach>"
    + "</if>"
    + "<!-- 动态排序（关键特殊逻辑）-->"
    + "<if test=\"orderByClause != null and orderByClause != ''\">"
    + "  ${orderByClause}"  // 注意：这里使用${}直接SQL拼接，不是#{}参数绑定
    + "</if>"
    + "<if test=\"orderByClause == null or orderByClause == ''\">"
    + "  ORDER BY t1.u_time DESC"  // 默认排序
    + "</if>"
    + "</script>"
})
List<MGoodsSpecExportVo> selectExportList(@Param("p1") MGoodsSpecVo searchCondition, 
                                          @Param("orderByClause") String orderByClause);
```

#### 5.2 SQL排序逻辑特殊说明
- 使用`${orderByClause}`而不是`#{orderByClause}`进行ORDER BY动态拼接
- 这是"特殊"的排序机制，允许运行时动态构建排序子句
- 包含MySQL行号生成：`(@row_num := @row_num + 1) as no`
- CROSS JOIN初始化行号：`CROSS JOIN (SELECT @row_num := 0) r`

### 6. 后端Export VO类创建：MGoodsSpecExportVo.java

#### 6.1 完整VO类结构
```java
/**
 * 规格主表导出VO - 按照规格管理页面导出模式设计
 */
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class MGoodsSpecExportVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @ExcelProperty(value = "NO", index = 0)
    private Integer no;

    @ExcelProperty(value = "规格编码", index = 1) 
    private String code;

    @ExcelProperty(value = "规格名称", index = 2)
    private String name;

    @ExcelProperty(value = "规格简称", index = 3)
    private String short_name;

    @ExcelProperty(value = "物料名称", index = 4)
    private String goods_name;

    @ExcelProperty(value = "计量单位", index = 5)  
    private String unit_name;

    @ExcelProperty(value = "规格型号", index = 6)
    private String spec_model;

    @ExcelProperty(value = "品牌名称", index = 7)
    private String brand_name;

    // 根据实际页面显示列继续添加字段
    
    @ExcelProperty(value = "状态", index = 15)
    private String enable_status;

    @ExcelProperty(value = "创建人", index = 16)
    private String c_name;

    @ExcelProperty(value = "创建时间", index = 17)
    @ColumnWidth(20)
    @DateTimeFormat("yyyy年MM月dd日 HH:mm:ss")
    private LocalDateTime c_time;

    @ExcelProperty(value = "修改人", index = 18)
    private String u_name;

    @ExcelProperty(value = "修改时间", index = 19) 
    @ColumnWidth(20)
    @DateTimeFormat("yyyy年MM月dd日 HH:mm:ss")
    private LocalDateTime u_time;
}
```

#### 6.2 字段映射说明
- 确保导出列与页面显示列完全匹配
- NO列使用MySQL行号生成，从1开始递增
- 状态字段转换显示值（启用/停用）
- 时间字段格式化与仓库管理保持一致

### 7. 权限配置文件修改（如果需要）

确保导出相关权限配置与仓库管理保持一致：
- P_SPEC:EXPORT 导出权限
- 页面按钮权限配置

### 8. 前端路由和权限配置

确保导出功能的路由权限配置正确，与仓库管理导出权限保持一致的命名规范。

## 实施注意事项

### 8.1 特殊SQL排序逻辑重要说明
- `${orderByClause}` 是直接SQL拼接，不是参数绑定
- 这种方式允许动态构建复杂的ORDER BY子句
- 行号生成机制：使用MySQL变量 `@row_num` 确保导出数据有连续编号
- 必须包含 `CROSS JOIN (SELECT @row_num := 0) r` 初始化行号

### 8.2 URL一致性保证
- exportall：全部导出端点
- export：选中导出端点  
- 与现有API保持命名规范一致

### 8.3 导出VO类列匹配
- 必须与页面显示列完全对应
- @ExcelProperty注解的index顺序要与页面列顺序一致
- 数据转换逻辑（如状态码转显示值）要在SQL或Service层处理

### 8.4 错误处理和用户体验
- 复制仓库管理的页面处理状态管理
- 导出过程中的loading状态
- Vue Tours用户引导
- 异常情况的友好提示

## 预期实施效果

完成后的规格管理导出功能将与仓库管理导出功能完全一致：
1. 单按钮切换到三按钮的导出模式
2. 导出模式下的多选checkbox功能
3. 动态SQL排序和行号生成
4. 统一的URL命名规范
5. 与页面显示完全匹配的导出列
6. 一致的用户体验和交互流程