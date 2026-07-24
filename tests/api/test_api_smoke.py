"""API 烟雾测试脚本 - 验证所有服务端点"""
import requests
import sys

BASE_URLS = {
    "backend": "http://localhost:8080",
    "ai_service": "http://localhost:8000",
}

def check(url, name):
    """检查一个端点并打印结果"""
    try:
        resp = requests.get(url, timeout=5)
        status = "PASS" if resp.status_code < 500 else "FAIL"
        print(f"  [{status}] {name}: {resp.status_code}")
        return resp.status_code < 500
    except requests.exceptions.ConnectionError:
        print(f"  [SKIP] {name}: service not running")
        return None
    except Exception as e:
        print(f"  [FAIL] {name}: {e}")
        return False


def test_backend():
    """测试后端"""
    print("\n=== Spring Boot Backend ===")
    results = []
    results.append(check(f"{BASE_URLS['backend']}/actuator/health", "Health Check"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/dashboard/stats", "Dashboard Stats"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/dashboard/fields", "Dashboard Fields"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/disease/knowledge", "Disease Knowledge"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/farming/irrigation", "Farming Irrigation"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/prediction/yield", "Prediction Yield"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/devices/summary", "Device Summary"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/traceability/stats", "Traceability Stats"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/permission/users", "Permission Users"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/weather/stats", "Weather Stats"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/market/stats", "Market Stats"))
    results.append(check(f"{BASE_URLS['backend']}/api/v1/monitor/stats", "Model Monitor Stats"))
    return results


def test_ai_service():
    """测试 AI 服务"""
    print("\n=== AI Service (FastAPI) ===")
    results = []
    results.append(check(f"{BASE_URLS['ai_service']}/health", "Health Check"))
    results.append(check(f"{BASE_URLS['ai_service']}/api/v1/diagnosis/health", "Diagnosis Health"))
    results.append(check(f"{BASE_URLS['ai_service']}/api/v1/rag/health", "RAG Health"))
    results.append(check(f"{BASE_URLS['ai_service']}/api/v1/agent/health", "Agent Health"))
    results.append(check(f"{BASE_URLS['ai_service']}/api/v1/model/versions", "Model Versions"))
    return results


def main():
    print("=" * 60)
    print("  SmartFarm API Smoke Test")
    print("=" * 60)

    backend_results = test_backend()
    ai_results = test_ai_service()

    print("\n" + "=" * 60)
    all_results = [r for r in backend_results + ai_results if r is not None]
    skipped = len(backend_results + ai_results) - len(all_results)
    passed = sum(1 for r in all_results if r)
    failed = sum(1 for r in all_results if not r)

    print(f"  Total: {len(all_results)}  Passed: {passed}  Failed: {failed}  Skipped: {skipped}")
    if failed > 0:
        print("  Result: FAILED")
        sys.exit(1)
    else:
        print("  Result: PASSED")
        sys.exit(0)


if __name__ == '__main__':
    main()
