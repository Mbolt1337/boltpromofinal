#!/usr/bin/env python
"""
Smoke Tests для критичных API endpoints BoltPromo

Проверяет доступность и базовую функциональность критичных API.
Использование:
    python backend/test_smoke.py

Логи сохраняются в: smoke_test.log
"""

import os
import sys
import json
import requests
import logging
from datetime import datetime
from typing import Dict, List, Tuple

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('smoke_test.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Конфигурация
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000/api/v1')
TIMEOUT = 10  # секунды


class SmokeTest:
    """Класс для выполнения smoke tests"""

    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.results: List[Dict] = []
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'BoltPromo-SmokeTest/1.0'
        })

    def test_endpoint(self, method: str, path: str, description: str,
                     expected_status: int = 200, **kwargs) -> bool:
        """Тестирует один endpoint"""
        url = f"{self.base_url}{path}"
        test_name = f"{method} {path}"

        try:
            logger.info(f"Testing: {test_name} - {description}")

            response = self.session.request(
                method=method,
                url=url,
                timeout=TIMEOUT,
                **kwargs
            )

            success = response.status_code == expected_status

            result = {
                'test': test_name,
                'description': description,
                'url': url,
                'method': method,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'success': success,
                'timestamp': datetime.now().isoformat()
            }

            # Логируем результат
            if success:
                logger.info(f"✅ PASS: {test_name} ({response.elapsed.total_seconds():.2f}s)")
            else:
                logger.error(f"❌ FAIL: {test_name} - Expected {expected_status}, got {response.status_code}")
                logger.error(f"Response: {response.text[:200]}")

            # Проверяем JSON response
            if success and 'application/json' in response.headers.get('Content-Type', ''):
                try:
                    data = response.json()
                    result['response_data'] = {
                        'count': data.get('count'),
                        'results_length': len(data.get('results', [])) if 'results' in data else None
                    }
                except json.JSONDecodeError:
                    logger.warning(f"⚠️  Invalid JSON in response for {test_name}")

            self.results.append(result)
            return success

        except requests.exceptions.Timeout:
            logger.error(f"❌ TIMEOUT: {test_name} - Request timeout after {TIMEOUT}s")
            self.results.append({
                'test': test_name,
                'description': description,
                'url': url,
                'success': False,
                'error': 'Timeout',
                'timestamp': datetime.now().isoformat()
            })
            return False

        except Exception as e:
            logger.error(f"❌ ERROR: {test_name} - {str(e)}")
            self.results.append({
                'test': test_name,
                'description': description,
                'url': url,
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
            return False

    def run_all_tests(self) -> Tuple[int, int]:
        """Запускает все smoke tests"""
        logger.info("=" * 60)
        logger.info("Starting BoltPromo API Smoke Tests")
        logger.info(f"API Base URL: {self.base_url}")
        logger.info("=" * 60)
        logger.info("")

        # 1. Health check
        self.test_endpoint(
            'GET', '/health/',
            'Health check endpoint'
        )

        # 2. Promocodes list
        self.test_endpoint(
            'GET', '/promocodes/',
            'Get all promocodes (paginated)'
        )

        # 3. Promocodes with filters
        self.test_endpoint(
            'GET', '/promocodes/?page=1&page_size=10',
            'Get promocodes with pagination'
        )

        # 4. Promocodes ordering
        self.test_endpoint(
            'GET', '/promocodes/?ordering=popular',
            'Get promocodes ordered by popular'
        )

        # 5. Hot promocodes
        self.test_endpoint(
            'GET', '/promocodes/hot/',
            'Get hot/featured promocodes'
        )

        # 6. Stores list
        self.test_endpoint(
            'GET', '/stores/',
            'Get all stores (paginated)'
        )

        # 7. Stores with filters
        self.test_endpoint(
            'GET', '/stores/?page=1&page_size=10',
            'Get stores with pagination'
        )

        # 8. Categories list
        self.test_endpoint(
            'GET', '/categories/',
            'Get all categories'
        )

        # 9. Categories with filters
        self.test_endpoint(
            'GET', '/categories/?page=1&page_size=10',
            'Get categories with pagination'
        )

        # 10. Showcases list
        self.test_endpoint(
            'GET', '/showcases/',
            'Get all showcases'
        )

        # 11. Banners list
        self.test_endpoint(
            'GET', '/banners/',
            'Get all banners'
        )

        # 12. Global stats
        self.test_endpoint(
            'GET', '/stats/global/',
            'Get global statistics'
        )

        # 13. Top promos stats
        self.test_endpoint(
            'GET', '/stats/top-promos/',
            'Get top promos statistics'
        )

        # 14. Top stores stats
        self.test_endpoint(
            'GET', '/stats/top-stores/',
            'Get top stores statistics'
        )

        # 15. Search endpoint
        self.test_endpoint(
            'GET', '/search/?q=test',
            'Search functionality'
        )

        # Подсчет результатов
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r['success'])
        failed_tests = total_tests - passed_tests

        logger.info("")
        logger.info("=" * 60)
        logger.info("Smoke Tests Summary")
        logger.info("=" * 60)
        logger.info(f"Total tests: {total_tests}")
        logger.info(f"✅ Passed: {passed_tests}")
        logger.info(f"❌ Failed: {failed_tests}")
        logger.info(f"Success rate: {(passed_tests/total_tests*100):.1f}%")

        # Средн время ответа
        response_times = [r.get('response_time', 0) for r in self.results if r['success']]
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            logger.info(f"Average response time: {avg_time:.2f}s")

        logger.info("=" * 60)

        # Сохраняем полный отчет в JSON
        self.save_report()

        return passed_tests, failed_tests

    def save_report(self):
        """Сохраняет детальный отчет в JSON"""
        report_file = f"smoke_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'total_tests': len(self.results),
                'passed': sum(1 for r in self.results if r['success']),
                'failed': sum(1 for r in self.results if not r['success']),
                'results': self.results
            }, f, indent=2, ensure_ascii=False)

        logger.info(f"Detailed report saved to: {report_file}")


def main():
    """Главная функция"""
    # Проверяем доступность API
    try:
        response = requests.get(f"{API_BASE_URL}/health/", timeout=5)
        logger.info(f"API is reachable: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Cannot reach API at {API_BASE_URL}")
        logger.error(f"Error: {e}")
        logger.error("Make sure the Django backend is running!")
        sys.exit(1)

    # Запускаем тесты
    smoke = SmokeTest()
    passed, failed = smoke.run_all_tests()

    # Exit code: 0 если все прошли, 1 если были ошибки
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
