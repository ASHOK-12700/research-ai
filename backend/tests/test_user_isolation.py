from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.api.routes.papers import get_authenticated_user_id
from app.services.paper_repository import SupabasePaperRepository


class _FakeResponse:
    def __init__(self, status_code: int, payload: dict | None = None):
        self.status_code = status_code
        self._payload = payload or {}

    def json(self):
        return self._payload


class _FakeQuery:
    def __init__(self, rows=None):
        self.rows = rows or []
        self.calls: list[tuple[str, str]] = []

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, column, value):
        self.calls.append((column, value))
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def execute(self):
        return SimpleNamespace(data=self.rows)


def test_get_authenticated_user_id_requires_bearer_token():
    with pytest.raises(ValueError, match="Missing Authorization header"):
        get_authenticated_user_id(None)


def test_get_authenticated_user_id_rejects_invalid_or_missing_token(monkeypatch):
    def fake_get(url, headers=None, timeout=None):
        return _FakeResponse(401, {'error': 'Unauthorized'})

    monkeypatch.setattr('app.api.routes.papers.requests.get', fake_get)

    with pytest.raises(ValueError):
        get_authenticated_user_id('Bearer invalid-token')


def test_get_authenticated_user_id_uses_supabase_user_response(monkeypatch):
    def fake_get(url, headers=None, timeout=None):
        assert url.endswith('/auth/v1/user')
        assert headers['Authorization'] == 'Bearer token-123'
        return _FakeResponse(200, {'id': 'user-a'})

    monkeypatch.setattr('app.api.routes.papers.requests.get', fake_get)

    assert get_authenticated_user_id('Bearer token-123') == 'user-a'


def test_paper_repository_list_scopes_to_authenticated_user(monkeypatch):
    query = _FakeQuery(rows=[{'id': 'paper-1'}])
    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', lambda *_args, **_kwargs: query)

    repo = SupabasePaperRepository()
    repo.list(user_id='user-b')

    assert ('user_id', 'user-b') in query.calls


def test_paper_repository_get_scopes_to_authenticated_user(monkeypatch):
    rows = [{
        'id': 'paper-1',
        'title': 'T',
        'filename': 'f.pdf',
        'storage_path': 'p',
        'page_count': 1,
        'project_id': None,
        'file_size_bytes': 100,
        'metadata': {},
        'sections': [],
        'uploaded_at': '2024-01-01T00:00:00Z',
        'full_text': 'text',
    }]
    query = _FakeQuery(rows=rows)
    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', lambda *_args, **_kwargs: query)

    repo = SupabasePaperRepository()
    repo.get('paper-1', user_id='user-b')

    assert ('id', 'paper-1') in query.calls
    assert ('user_id', 'user-b') in query.calls


def test_user_specific_paper_queries_do_not_overlap(monkeypatch):
    user_a_rows = [{'id': 'paper-a', 'user_id': 'user-a', 'title': 'A', 'filename': 'a.pdf', 'storage_path': 'path_a', 'page_count': 1, 'project_id': None, 'file_size_bytes': 100, 'metadata': {}, 'sections': [], 'uploaded_at': '2024-01-01T00:00:00Z', 'full_text': 'text-a'}]
    user_b_rows = [{'id': 'paper-b', 'user_id': 'user-b', 'title': 'B', 'filename': 'b.pdf', 'storage_path': 'path_b', 'page_count': 2, 'project_id': None, 'file_size_bytes': 200, 'metadata': {}, 'sections': [], 'uploaded_at': '2024-01-01T00:00:00Z', 'full_text': 'text-b'}]

    def fake_table(table_name, *_args, **_kwargs):
        if table_name == 'papers':
            return _FakeQuery(rows=user_a_rows if 'user-a' == 'user-a' else user_b_rows)
        return _FakeQuery(rows=[])

    def fake_table_for_user(user_scope):
        def _builder(*_args, **_kwargs):
            if user_scope == 'user-a':
                return _FakeQuery(rows=user_a_rows)
            return _FakeQuery(rows=user_b_rows)
        return _builder

    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', lambda *_args, **_kwargs: _FakeQuery(rows=[]))

    repo = SupabasePaperRepository()
    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', fake_table_for_user('user-a'))
    assert repo.list(user_id='user-a')[0].id == 'paper-a'
    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', fake_table_for_user('user-b'))
    assert repo.list(user_id='user-b')[0].id == 'paper-b'
    query = _FakeQuery(rows=[])
    monkeypatch.setattr('app.services.paper_repository.supabase_service.table', lambda *_args, **_kwargs: query)
    assert repo.get('paper-a', user_id='user-b') is None
