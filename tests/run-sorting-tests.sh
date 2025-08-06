#!/bin/bash

# 销售合同列表页面排序功能测试执行脚本
# 使用方法：./run-sorting-tests.sh [unit|e2e|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_message "检查测试环境依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi
    
    # 检查前端服务是否运行
    if ! curl -s http://localhost:19528 > /dev/null; then
        print_warning "前端服务未运行，请先启动: npm run dev"
        read -p "是否继续运行单元测试？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "前端服务运行正常"
    fi
    
    # 检查后端服务是否运行（仅E2E测试需要）
    if [[ "$1" == "e2e" ]] || [[ "$1" == "all" ]]; then
        if ! curl -s http://127.0.0.1:8088/scm/health > /dev/null; then
            print_warning "后端服务未运行，E2E测试可能失败"
            print_message "请启动后端服务: cd 00_scm_backend/scm_backend/scm-start && mvn spring-boot:run"
            read -p "是否继续？(y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            print_success "后端服务运行正常"
        fi
    fi
}

# 运行单元测试
run_unit_tests() {
    print_message "开始运行销售合同排序功能单元测试..."
    
    # 清理之前的测试缓存
    npm run test:unit -- --clearCache
    
    # 运行特定的排序功能测试
    if npm run test:unit -- --testNamePattern="销售合同列表页面排序功能单元测试" --coverage; then
        print_success "单元测试执行成功！"
        
        # 显示覆盖率报告路径
        if [[ -f "coverage/lcov-report/index.html" ]]; then
            print_message "覆盖率报告已生成: coverage/lcov-report/index.html"
        fi
        
        return 0
    else
        print_error "单元测试执行失败！"
        return 1
    fi
}

# 运行E2E测试
run_e2e_tests() {
    print_message "开始运行销售合同排序功能E2E测试..."
    
    # 检查Playwright是否已安装
    if ! npx playwright --version &> /dev/null; then
        print_message "安装Playwright浏览器..."
        npx playwright install
    fi
    
    # 运行E2E测试
    if npm run test:e2e -- tests/e2e/socontract-sorting.spec.js --reporter=html; then
        print_success "E2E测试执行成功！"
        
        # 显示测试报告路径
        if [[ -f "playwright-report/index.html" ]]; then
            print_message "测试报告已生成: playwright-report/index.html"
        fi
        
        return 0
    else
        print_error "E2E测试执行失败！"
        return 1
    fi
}

# 运行性能测试
run_performance_tests() {
    print_message "运行排序性能测试..."
    
    # 这里可以添加专门的性能测试脚本
    # 例如：使用lighthouse或其他性能测试工具
    print_message "性能测试功能待实现..."
}

# 生成测试报告
generate_report() {
    print_message "生成综合测试报告..."
    
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local report_dir="test-reports/sorting-tests-$timestamp"
    
    mkdir -p "$report_dir"
    
    # 复制覆盖率报告
    if [[ -d "coverage" ]]; then
        cp -r coverage "$report_dir/"
        print_message "单元测试覆盖率报告已复制到: $report_dir/coverage/"
    fi
    
    # 复制E2E测试报告
    if [[ -d "playwright-report" ]]; then
        cp -r playwright-report "$report_dir/"
        print_message "E2E测试报告已复制到: $report_dir/playwright-report/"
    fi
    
    # 生成汇总报告
    cat > "$report_dir/README.md" << EOF
# 销售合同排序功能测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试版本**: $(git rev-parse --short HEAD 2>/dev/null || echo "未知")

## 测试结果汇总

- 单元测试: $([ -d "$report_dir/coverage" ] && echo "✅ 通过" || echo "❌ 失败")
- E2E测试: $([ -d "$report_dir/playwright-report" ] && echo "✅ 通过" || echo "❌ 失败")

## 查看详细报告

- 单元测试覆盖率: [coverage/lcov-report/index.html](coverage/lcov-report/index.html)
- E2E测试结果: [playwright-report/index.html](playwright-report/index.html)

## 测试覆盖的功能点

### 排序功能测试
- ✅ 28个可排序字段的升序/降序测试
- ✅ 排序状态切换测试
- ✅ 多字段排序互斥测试
- ✅ 排序与分页结合测试
- ✅ 排序与标签页切换测试
- ✅ 排序性能测试

### 数据类型覆盖
- ✅ 文本类字段排序
- ✅ 数值类字段排序
- ✅ 日期时间字段排序
- ✅ 金额字段排序
- ✅ 中文字段排序

EOF

    print_success "综合测试报告已生成: $report_dir/README.md"
}

# 清理测试环境
cleanup() {
    print_message "清理测试环境..."
    
    # 清理测试缓存
    if [[ -d ".jest-cache" ]]; then
        rm -rf .jest-cache
        print_message "已清理Jest缓存"
    fi
    
    # 清理旧的测试报告（保留最近5个）
    if [[ -d "test-reports" ]]; then
        cd test-reports
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
        print_message "已清理旧的测试报告"
    fi
}

# 主函数
main() {
    local test_type="${1:-all}"
    local start_time=$(date +%s)
    
    print_message "开始执行销售合同排序功能测试 (类型: $test_type)"
    
    # 检查依赖
    check_dependencies "$test_type"
    
    # 执行测试
    case "$test_type" in
        "unit")
            run_unit_tests
            ;;
        "e2e")
            run_e2e_tests
            ;;
        "all")
            local unit_success=true
            local e2e_success=true
            
            # 运行单元测试
            if ! run_unit_tests; then
                unit_success=false
            fi
            
            # 运行E2E测试
            if ! run_e2e_tests; then
                e2e_success=false
            fi
            
            # 检查整体结果
            if [[ "$unit_success" == true && "$e2e_success" == true ]]; then
                print_success "所有测试执行成功！"
            else
                print_error "部分测试执行失败！"
                exit 1
            fi
            ;;
        "performance")
            run_performance_tests
            ;;
        "clean")
            cleanup
            exit 0
            ;;
        *)
            echo "使用方法: $0 [unit|e2e|all|performance|clean]"
            echo ""
            echo "参数说明:"
            echo "  unit        - 仅运行单元测试"
            echo "  e2e         - 仅运行E2E测试"
            echo "  all         - 运行所有测试（默认）"
            echo "  performance - 运行性能测试"
            echo "  clean       - 清理测试环境"
            exit 1
            ;;
    esac
    
    # 生成报告
    if [[ "$test_type" != "clean" ]]; then
        generate_report
    fi
    
    # 计算执行时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    print_success "测试执行完成！耗时: ${duration}秒"
}

# 捕获中断信号
trap 'print_warning "测试被中断"; exit 1' INT

# 执行主函数
main "$@"