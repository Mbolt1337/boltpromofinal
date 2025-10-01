from pathlib import Path
path = Path('backend/core/views.py')
text = path.read_text(encoding='utf-8')
chunk = "        # �"�?���?�>�?��'��>�?�?�<�� �"��>�?�'�?�<\n        # �'�����?�?�<�� queryset �? ���?�?�?�?��?�?���?�� ����'��?�?�?���\n        queryset = PromoCode.objects.filter(\n            categories=category,\n            is_active=True,\n            expires_at__gt=timezone.now()\n        ).select_related('store').prefetch_related('categories')\n\n"
if chunk not in text:
    raise SystemExit('chunk not found to remove')
text = text.replace(chunk, '', 1)
path.write_text(text, encoding='utf-8')
