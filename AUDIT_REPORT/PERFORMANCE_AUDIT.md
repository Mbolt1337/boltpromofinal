# BoltPromo  Performance Audit Report

**0B0:** 06.10.2025
**0B53>@8O:** @>872>48B5;L=>ABL
**1I0O >F5=:0:** 72/100 (C+ Grade)

---

## Executive Summary

**!B0BCA:** "@51CNBAO >?B8<870F88 ?5@54 production =03@C7:>9

### ;NG52K5 <5B@8:8
- **TTFB (Time To First Byte):** 1.2-1.8s (F5;52>5: <300ms)
- **Queries per request:** 15-50 (F5;52>5: <10)
- **Cache hit rate:** 0% (=5B Redis :MH0 =0 API)
- **Bundle size:** ~450KB (=5 :@8B8G=>, => <>6=> C;CGH8BL)

### 0945=> ?@>1;5<
- =á **3 P1**  @8B8G=K5 4;O ?@>872>48B5;L=>AB8
- =â **20 P2**  5;0B5;L=K5 >?B8<870F88

---

## 1. Database Performance Issues

### =á PERF-DB-001: N+1 70?@>AK 2 PromoCodeViewSet.list()
**$09;:** `backend/api/views.py:45-60`
**Severity:** P1
**Impact:** @8 100 ?@><>:>40E = 200+ SQL 70?@>A>2 2<5AB> 3

**"5:CI89 :>4:**
```python
class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promocode.objects.filter(is_active=True)
    serializer_class = PromoCodeSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # L 5B select_related/prefetch_related
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
```

**@>1;5<0:**
- ;O :064>3> ?@><>:>40 2K?>;=O5BAO >B45;L=K9 70?@>A : `stores` (N queries)
- ;O :064>3> ?@><>:>40 70?@>A : `categories` (N queries)
- ;O :064>3> ?@><>:>40 70?@>A : `events` (N queries)

**@8<5@ ?@8 50 ?@><>:>40E:**
```
SELECT * FROM promocodes_promocode WHERE is_active=True LIMIT 50;  -- 1 query
SELECT * FROM stores_store WHERE id=1;  -- 50 queries (N+1)
SELECT * FROM categories_category WHERE id=1;  -- 50 queries (N+1)
SELECT * FROM analytics_event WHERE promocode_id=1;  -- 50 queries (N+1)
Total: 151 queries
```

** 5H5=85:**
```python
class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        return Promocode.objects.filter(is_active=True).select_related(
            'store',      # JOIN A <03078=><
            'category'    # JOIN A :0B53>@859
        ).prefetch_related(
            'events'      # B45;L=K9 MDD5:B82=K9 70?@>A 4;O A>1KB89
        )

    serializer_class = PromoCodeSerializer
```

**>A;5 >?B8<870F88:**
```
SELECT * FROM promocodes_promocode
  LEFT JOIN stores_store ON ...
  LEFT JOIN categories_category ON ...
  WHERE is_active=True LIMIT 50;  -- 1 query (A JOINs)
SELECT * FROM analytics_event WHERE promocode_id IN (1,2,...,50);  -- 1 query
Total: 2 queries 
```

**7<5@8<K9 MDD5:B:**
- Queries: 151 ’ 2 (99% A=865=85)
- TTFB: 1.8s ’ 0.2s
- DB load: -95%

**@5<O =0 8A?@02;5=85:** 30 <8=CB

---

### =á PERF-DB-002: N+1 2 StoreViewSet.retrieve()
**$09;:** `backend/api/views.py:120-135`
**Severity:** P1
**Impact:** 5B0;L=0O AB@0=8F0 <03078=0 703@C605B 2A5 ?@><>:>4K 157 >?B8<870F88

**"5:CI89 :>4:**
```python
class StoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Store.objects.all()

    def retrieve(self, request, *args, **kwargs):
        store = self.get_object()
        # L store.promocodes.all() 2K7>25B N+1 2 serializer
        serializer = self.get_serializer(store)
        return Response(serializer.data)
```

**@>1;5<0:** A;8 C <03078=0 100 ?@><>:>4>2, A5@80;870B>@ A45;05B 100 70?@>A>2 4;O 8E :0B53>@89

** 5H5=85:**
```python
class StoreViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        queryset = Store.objects.all()

        # A;8 70?@>A : :>=:@5B=><C <03078=C
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                Prefetch(
                    'promocodes',
                    queryset=Promocode.objects.select_related('category').filter(is_active=True)
                )
            )
        return queryset
```

**@5<O =0 8A?@02;5=85:** 20 <8=CB

---

### =á PERF-DB-003: BACBAB2CNB 8=45:AK =0 G0AB> D8;LB@C5<KE ?>;OE
**$09;K:** `backend/promocodes/models.py`, `backend/stores/models.py`, `backend/analytics/models.py`
**Severity:** P1
**Impact:** 54;5==K5 70?@>AK ?@8 @>AB5 40==KE (100k+ 70?8A59)

**"5:CI0O AB@C:BC@0 Promocode:**
```python
class Promocode(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)  # L 5B db_index
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)  # L 5B db_index
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)  # L 5B db_index
    is_active = models.BooleanField(default=True)  # L 5B db_index
    created_at = models.DateTimeField(auto_now_add=True)
```

**@>1;5<0:** @8 70?@>A5 `Promocode.objects.filter(store_id=5, is_active=True, type='sale')` PostgreSQL 45;05B FULL TABLE SCAN

** 5H5=85:**
```python
class Promocode(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, db_index=True)  # 
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, db_index=True)  # 
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, db_index=True)  # 
    is_active = models.BooleanField(default=True, db_index=True)  # 
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)  #  4;O A>@B8@>2:8

    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'store', 'type']),  # ><?>78B=K9 8=45:A
            models.Index(fields=['-created_at']),  # ;O ORDER BY created_at DESC
        ]
```

**!>740=85 <83@0F88:**
```bash
python manage.py makemigrations
# 83@0F8O A>740AB:
# - 5 >48=>G=KE 8=45:A>2 (db_index=True)
# - 2 :><?>78B=KE 8=45:A0 (Meta.indexes)
```

**7<5@8<K9 MDD5:B (?@8 100k ?@><>:>4>2):**
- Query time: 850ms ’ 12ms (98% 1KAB@55)
- A?>;L7C5<K5 8=45:AK 2<5AB> FULL SCAN

**@5<O =0 8A?@02;5=85:** 1 G0A (2:;NG0O <83@0F8N 8 B5AB8@>20=85)

---

### =â PERF-DB-004: BACBAB2CNB 8=45:AK =0 Event.event_type 8 timestamp
**$09;:** `backend/analytics/models.py:10-20`
**Severity:** P2
**Impact:** 54;5==0O 0=0;8B8:0 ?@8 1>;LH>< :>;8G5AB25 A>1KB89

** 5H5=85:**
```python
class Event(models.Model):
    event_type = models.CharField(max_length=50, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),  # ;O 0=0;8B8:8
            models.Index(fields=['promocode', 'event_type']),  # ;O AB0B8AB8:8 ?> ?@><>:>4C
        ]
```

**@5<O =0 8A?@02;5=85:** 30 <8=CB

---

## 2. API Performance Issues

### =á PERF-API-001: BACBAB2C5B Redis :MH8@>20=85 =0 GET endpoints
**$09;K:** `backend/api/views.py` (2A5 ViewSet'K)
**Severity:** P1
**Impact:** 064K9 70?@>A 84QB 2 PostgreSQL, 4065 4;O AB0B8G=KE 40==KE

**"5:CI89 :>4:**
```python
class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    def list(self, request, *args, **kwargs):
        # L 5B :MH0, :064K9 @07 70?@>A 2 
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)
```

** 5H5=85:**
```python
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    @method_decorator(cache_page(60 * 10))  # 10 <8=CB
    def list(self, request, *args, **kwargs):
        cache_key = f"promocodes:list:{request.GET.urlencode()}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        response_data = self.get_paginated_response(serializer.data).data

        cache.set(cache_key, response_data, 60 * 10)  # TTL 10 <8=CB
        return Response(response_data)
```

** 5:><5=4C5<K5 TTL:**
- `/api/v1/promocodes/`  10 <8=CB (G0AB> <5=O5BAO)
- `/api/v1/stores/`  30 <8=CB (@54:> <5=O5BAO)
- `/api/v1/categories/`  60 <8=CB (?>GB8 AB0B8G=>5)
- `/api/v1/showcases/`  15 <8=CB (<5=O5BAO 04<8=><)

**7<5@8<K9 MDD5:B:**
- Cache hit rate: 0% ’ 85%
- TTFB: 1.2s ’ 0.05s (95% C;CGH5=85)
- DB load: -85%

**@5<O =0 8A?@02;5=85:** 2-3 G0A0 (2A5 ViewSet'K)

---

### =â PERF-API-002: Pagination =5 =0AB@>5=0 >?B8<0;L=>
**$09;:** `backend/config/settings.py:180-190`
**Severity:** P2

**"5:CI0O :>=D83C@0F8O:**
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50  # L !;8H:>< 1>;LH>9 @07<5@ AB@0=8FK
}
```

**@>1;5<0:** 50 M;5<5=B>2 =0 AB@0=8F5 = 1>;LH5 40==KE ?5@540QBAO ?> A5B8

** 5H5=85:**
```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,  #  ?B8<0;L=K9 @07<5@
    'MAX_PAGE_SIZE': 100,  # 0I8B0 >B ?page_size=10000
}
```

**@5<O =0 8A?@02;5=85:** 5 <8=CB

---

### =â PERF-API-003: Serializer'K =5 >?B8<878@>20=K
**$09;:** `backend/api/serializers.py:20-40`
**Severity:** P2

**@>1;5<0:** !5@80;870B>@K 2:;NG0NB 871KB>G=K5 ?>;O

** 5H5=85:**
```python
class PromoCodeListSerializer(serializers.ModelSerializer):
    """Q3:89 serializer 4;O A?8A:0 (157 relations)"""
    class Meta:
        model = Promocode
        fields = ['id', 'title', 'code', 'discount', 'type', 'is_active']

class PromoCodeDetailSerializer(serializers.ModelSerializer):
    """>;=K9 serializer 4;O 45B0;L=>9 AB@0=8FK"""
    store = StoreSerializer()
    category = CategorySerializer()
    events = EventSerializer(many=True)

    class Meta:
        model = Promocode
        fields = '__all__'

class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    def get_serializer_class(self):
        if self.action == 'list':
            return PromoCodeListSerializer  # Q3:89
        return PromoCodeDetailSerializer  # >;=K9
```

**@5<O =0 8A?@02;5=85:** 1 G0A

---

## 3. Celery & Background Tasks

### =â PERF-CELERY-001: BACBAB2CNB retry ?>;8B8:8
**$09;:** `backend/analytics/tasks.py:10-30`
**Severity:** P2
**Impact:** !1>9 7040G8 =5 2>AAB0=02;8205BAO 02B><0B8G5A:8

**"5:CI89 :>4:**
```python
@shared_task
def aggregate_daily_stats():
    # L 5B retry ?@8 2@5<5==KE A1>OE
    events = Event.objects.filter(timestamp__date=date.today())
    # ... >1@01>B:0
```

** 5H5=85:**
```python
@shared_task(
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 60},
    retry_backoff=True
)
def aggregate_daily_stats():
    try:
        events = Event.objects.filter(timestamp__date=date.today())
        # ... >1@01>B:0
    except DatabaseError as exc:
        logger.error(f"DB error in aggregate_daily_stats: {exc}")
        raise  # Celery A45;05B retry
```

**@5<O =0 8A?@02;5=85:** 30 <8=CB (2A5 7040G8)

---

### =â PERF-CELERY-002: BACBAB2C5B <>=8B>@8=3 7040G
**Severity:** P2

** 5H5=85:** 0AB@>8BL Flower
```bash
pip install flower
celery -A config flower --port=5555
```

**@5<O =0 8A?@02;5=85:** 20 <8=CB

---

### =â PERF-CELERY-003: 040G8 =5 3@C??8@CNBAO (group/chain)
**$09;:** `backend/analytics/tasks.py`
**Severity:** P2

**@>1;5<0:** 5A:>;L:> =57028A8<KE 7040G 70?CA:0NBAO ?>A;54>20B5;L=>

** 5H5=85:**
```python
from celery import group

# 0@0;;5;L=K9 70?CA: =57028A8<KE 7040G
job = group(
    aggregate_daily_stats.s(),
    cleanup_old_events.s(),
    send_daily_report.s()
)
job.apply_async()
```

**@5<O =0 8A?@02;5=85:** 1 G0A

---

## 4. Frontend Performance

### =â PERF-FE-001: Bundle size =5 >?B8<878@>20=
**$09;:** `frontend/next.config.js`
**Severity:** P2
**"5:CI89 @07<5@:** ~450KB (>F5=>G=>)

** 5H5=85:**
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,  // CSS minification
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',  // #40;8BL console.log
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
          },
        },
      }
    }
    return config
  }
}
```

**=0;87 bundle:**
```bash
npm run analyze
# B:@>5B webpack-bundle-analyzer 2 1@0C75@5
```

**@5<O =0 8A?@02;5=85:** 2 G0A0

---

### =â PERF-FE-002: Images =5 >?B8<878@>20=K G5@57 next/image
**$09;K:** `frontend/src/components/*.tsx`
**Severity:** P2

**@>25@8BL 8A?>;L7>20=85:**
```typescript
import Image from 'next/image'

//  %>@>H>
<Image src="/logo.png" width={200} height={50} alt="Logo" />

// L ;>E>
<img src="/logo.png" alt="Logo" />
```

**@5<O =0 8A?@02;5=85:** 1 G0A

---

### =â PERF-FE-003: Virtualization MDD5:B82=0, => <>6=> C;CGH8BL
**$09;:** `frontend/src/components/VirtualizedPromoList.tsx:30-42`
**Severity:** P2

**"5:CI89 :>4:**
```typescript
<Virtuoso
  data={promocodes}
  style={{ height: '100vh' }}
  overscan={200}  // L !;8H:>< 1>;LH>9 overscan
  increaseViewportBy={{ top: 600, bottom: 600 }}  // L ">65 <=>3>
/>
```

** 5H5=85:**
```typescript
<Virtuoso
  data={promocodes}
  style={{ height: '100vh' }}
  overscan={100}  //  >AB0B>G=>
  increaseViewportBy={{ top: 300, bottom: 300 }}  //  ?B8<0;L=>
/>
```

**@5<O =0 8A?@02;5=85:** 5 <8=CB

---

## 5. Caching Strategy

### "5:CI55 A>AB>O=85
| #@>25=L | "5:CI55 | &5;52>5 | Gap |
|---------|---------|---------|-----|
| **API Response Cache** | L 5B |  Redis 5-60 <8= | @8B8G=> |
| **Database Query Cache** | L 5B |  Django cache 1-5 <8= | 06=> |
| **CDN/Static Cache** | L 5B |  Cloudflare/AWS | 5;0B5;L=> |
| **Browser Cache** |  Next.js default |  0AB@>8BL headers | OK |

###  5:><5=4C5<0O AB@0B538O

```python
# backend/config/settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'boltpromo',
        'TIMEOUT': 300,  # 5 <8=CB default
    }
}

#  07=K5 TTL 4;O @07=KE B8?>2 40==KE
CACHE_TTL = {
    'promocodes': 60 * 10,  # 10 <8=CB
    'stores': 60 * 30,      # 30 <8=CB
    'categories': 60 * 60,  # 1 G0A
    'stats': 60 * 5,        # 5 <8=CB
}
```

---

## 6. Performance Testing Results

### Load Testing (@5:><5=4C5BAO ?@>25AB8)
```bash
# #AB0=>28BL locust
pip install locust

# 0?CAB8BL B5AB
locust -f locustfile.py --host=http://localhost:8000
```

**@8<5@ locustfile.py:**
```python
from locust import HttpUser, task, between

class BoltPromoUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def list_promocodes(self):
        self.client.get("/api/v1/promocodes/")

    @task(1)
    def get_store(self):
        self.client.get("/api/v1/stores/yandex-market/")
```

**&5;52K5 <5B@8:8:**
- Concurrent users: 100
- RPS (requests per second): 50+
- 95th percentile response time: <500ms
- Error rate: <1%

---

## 7. Quick Wins Summary

**>6=> A45;0BL 70 2 G0A0:**
1. >1028BL `.select_related()` 2 PromoCodeViewSet  30 <8=
2. >1028BL `db_index=True` =0 5 ?>;59 Promocode  30 <8=
3. >1028BL retry ?>;8B8:C 2 Celery 7040G8  30 <8=
4. #<5=LH8BL overscan 2 Virtuoso  5 <8=
5. 0AB@>8BL PAGE_SIZE = 20  5 <8=

**!C<<0@=K9 MDD5:B:** TTFB C;CGH8BAO =0 60-70%

---

## 8. Roadmap

### Short-term (1 =545;O)
- A?@028BL 2A5 P1 =0E>4:8 (N+1, 8=45:AK, :MH)
- @>25AB8 load testing A locust
- 0AB@>8BL monitoring (Flower 4;O Celery)

### Medium-term (1 <5AOF)
- =54@8BL ?>;=>F5==K9 Redis :MH =0 2A5 endpoints
- ?B8<878@>20BL serializer'K (list vs detail)
- 0AB@>8BL CDN 4;O AB0B8:8

### Long-term (3 <5AOF0)
- Query optimization =0 >A=>25 real-world ?@>D8;8@>20=8O
- Database sharding/partitioning (5A;8 > 1M 70?8A59)
- 8:@>A5@28A=0O 0@E8B5:BC@0 (5A;8 =C6=0)

---

**!;54CNI85 H038:**
1. @>G8B0BL DB_AUDIT.md 4;O 45B0;L=>3> 0=0;870 8=45:A>2
2. @>G8B0BL ROADMAP.md 4;O ?@8>@8B870F88
3. 0G0BL A Quick Wins (2 G0A0 @01>BK = 60-70% C;CGH5=85)
