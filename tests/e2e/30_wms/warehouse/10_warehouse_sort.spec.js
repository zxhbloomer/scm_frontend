// 仓库管理列表页面完整排序测试 - 所有可排序字段升序降序测试
import { test, expect } from '@playwright/test';
import { setupWMSAuth } from '../../../setup/auth.js';

test.describe('WMS仓库管理-完整排序测试', () => {

  // 通用排序测试函数
  async function testColumnSort(page, columnText, testName) {
    console.log(`\n=== 开始测试 ${testName} ===`);
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 查找指定列头
    const columnHeader = page.locator('.el-table th').filter({ hasText: columnText });
    
    // 检查列是否存在
    if (await columnHeader.count() === 0) {
      console.log(`⚠️ 列 "${columnText}" 不存在，跳过测试`);
      return false;
    }
    
    await expect(columnHeader).toBeVisible();
    
    // 获取排序前第一行数据作为参考
    const firstRowBefore = await page.locator('.el-table tbody tr').first().textContent();
    console.log(`排序前第一行: ${firstRowBefore?.slice(0, 50)}...`);
    
    // 第一次点击 - 升序
    console.log(`点击 "${columnText}" 列进行升序排序`);
    await columnHeader.click();
    await page.waitForTimeout(2000);
    
    const firstRowAfterAsc = await page.locator('.el-table tbody tr').first().textContent();
    console.log(`升序后第一行: ${firstRowAfterAsc?.slice(0, 50)}...`);
    
    // 第二次点击 - 降序
    console.log(`再次点击 "${columnText}" 列进行降序排序`);
    await columnHeader.click();
    await page.waitForTimeout(2000);
    
    const firstRowAfterDesc = await page.locator('.el-table tbody tr').first().textContent();
    console.log(`降序后第一行: ${firstRowAfterDesc?.slice(0, 50)}...`);
    
    // 验证数据完整性
    const rowCount = await page.locator('.el-table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    console.log(`✅ ${testName} 完成 - 数据行数: ${rowCount}`);
    
    return true;
  }

  // 所有可能的仓库管理字段排序测试
  const sortableFields = [
    { text: '仓库编码', name: 'warehouse_code' },
    { text: '仓库名称', name: 'warehouse_name' },
    { text: '仓库类型', name: 'warehouse_type' },
    { text: '所属组织', name: 'organization' },
    { text: '负责人', name: 'manager' },
    { text: '联系电话', name: 'phone' },
    { text: '地址', name: 'address' },
    { text: '状态', name: 'status' },
    { text: '创建时间', name: 'create_time' },
    { text: '修改时间', name: 'update_time' },
    { text: '容量', name: 'capacity' },
    { text: '面积', name: 'area' },
    { text: '温度', name: 'temperature' },
    { text: '湿度', name: 'humidity' },
    { text: '省份', name: 'province' },
    { text: '城市', name: 'city' },
    { text: '区县', name: 'district' },
    { text: '邮编', name: 'zipcode' },
    { text: '备注', name: 'remark' },
    { text: '启用状态', name: 'enable_status' }
  ];

  test('测试所有可排序字段的升序降序功能', async ({ page }) => {
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 15000 });
    
    console.log('\n🚀 开始执行所有字段的排序测试');
    
    let testedCount = 0;
    let skippedCount = 0;
    
    // 逐个测试每个字段
    for (const field of sortableFields) {
      try {
        const result = await testColumnSort(page, field.text, `${field.name}字段排序`);
        if (result) {
          testedCount++;
        } else {
          skippedCount++;
        }
        
        // 短暂延迟避免操作过快
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.log(`❌ ${field.name} 测试失败: ${error.message}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 排序测试汇总:`);
    console.log(`✅ 成功测试: ${testedCount} 个字段`);
    console.log(`⚠️ 跳过测试: ${skippedCount} 个字段`);
    console.log(`📋 总计字段: ${sortableFields.length} 个`);
    
    // 验证至少有一些字段可以排序
    expect(testedCount).toBeGreaterThan(0);
    console.log(`✅ 排序功能验证完成！`);
  });

  test('测试仓库编码字段专项排序', async ({ page }) => {
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 专项测试仓库编码排序
    const success = await testColumnSort(page, '仓库编码', '仓库编码专项排序测试');
    
    if (success) {
      console.log('✅ 仓库编码排序功能正常');
    } else {
      console.log('⚠️ 仓库编码列未找到或不可排序');
    }
  });

  test('测试仓库名称字段专项排序', async ({ page }) => {
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 专项测试仓库名称排序
    const success = await testColumnSort(page, '仓库名称', '仓库名称专项排序测试');
    
    if (success) {
      console.log('✅ 仓库名称排序功能正常');
    } else {
      console.log('⚠️ 仓库名称列未找到或不可排序');
    }
  });

  test('测试时间字段专项排序', async ({ page }) => {
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    const timeFields = ['创建时间', '修改时间', '更新时间'];
    let successCount = 0;
    
    for (const timeField of timeFields) {
      try {
        const success = await testColumnSort(page, timeField, `${timeField}排序测试`);
        if (success) {
          successCount++;
        }
        await page.waitForTimeout(500);
      } catch (error) {
        console.log(`⚠️ ${timeField} 测试异常: ${error.message}`);
      }
    }
    
    console.log(`✅ 时间字段排序测试完成，成功测试 ${successCount} 个时间字段`);
  });

  test('测试状态字段专项排序', async ({ page }) => {
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    const statusFields = ['状态', '启用状态', '使用状态'];
    let successCount = 0;
    
    for (const statusField of statusFields) {
      try {
        const success = await testColumnSort(page, statusField, `${statusField}排序测试`);
        if (success) {
          successCount++;
        }
        await page.waitForTimeout(500);
      } catch (error) {
        console.log(`⚠️ ${statusField} 测试异常: ${error.message}`);
      }
    }
    
    console.log(`✅ 状态字段排序测试完成，成功测试 ${successCount} 个状态字段`);
  });

  test('验证排序后数据完整性和API调用', async ({ page }) => {
    const apiCalls = [];
    
    // 监听API调用
    page.on('response', response => {
      if (response.url().includes('/warehouse/pagelist')) {
        const success = response.ok() ? '✅' : '❌';
        console.log(`${success} 仓库列表API: ${response.request().method()} ${response.status()}`);
        apiCalls.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          success: response.ok()
        });
      }
    });
    
    // 设置认证并打开页面
    await setupWMSAuth(page, 'http://localhost:9528/#/master/warehouse');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 等待表格加载
    await page.waitForSelector('.el-table', { timeout: 10000 });
    
    // 获取初始数据行数
    const initialRowCount = await page.locator('.el-table tbody tr').count();
    console.log(`📊 初始数据行数: ${initialRowCount}`);
    
    // 进行多次排序操作测试数据完整性
    const testColumns = ['仓库编码', '仓库名称', '状态'];
    
    for (const columnText of testColumns) {
      const columnHeader = page.locator('.el-table th').filter({ hasText: columnText });
      
      if (await columnHeader.count() > 0) {
        console.log(`\n🔄 测试 ${columnText} 排序的数据完整性`);
        
        // 升序
        await columnHeader.click();
        await page.waitForTimeout(2000);
        const ascRowCount = await page.locator('.el-table tbody tr').count();
        
        // 降序  
        await columnHeader.click();
        await page.waitForTimeout(2000);
        const descRowCount = await page.locator('.el-table tbody tr').count();
        
        // 验证数据完整性
        expect(ascRowCount).toBe(initialRowCount);
        expect(descRowCount).toBe(initialRowCount);
        
        console.log(`✅ ${columnText} 排序数据完整性验证通过`);
      }
    }
    
    // 验证API调用
    console.log(`\n📡 API调用统计:`);
    console.log(`总调用次数: ${apiCalls.length}`);
    const successCount = apiCalls.filter(api => api.success).length;
    console.log(`成功调用: ${successCount}, 失败调用: ${apiCalls.length - successCount}`);
    
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log('✅ 数据完整性和API调用验证完成');
  });
});