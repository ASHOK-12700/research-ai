from __future__ import annotations

from typing import Any

from supabase import Client, create_client

from app.core.config import get_settings


class SupabaseService:
    def __init__(self) -> None:
        settings = get_settings()
        self.url = settings.SUPABASE_URL
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self._client: Client | None = None

    def get_client(self) -> Client:
        if not self.url or not self.service_role_key:
            raise RuntimeError("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.")

        if self._client is None:
            self._client = create_client(self.url, self.service_role_key)
        return self._client

    def upload_pdf(self, paper_id: str, file_bytes: bytes, filename: str, bucket_name: str = "research-papers") -> str:
        client = self.get_client()
        storage_path = f"papers/{paper_id}/{filename}"
        storage = client.storage.from_(bucket_name)
        storage.upload(path=storage_path, file=file_bytes, file_options={"content-type": "application/pdf", "upsert": "true"})
        return storage_path

    def get_public_url(self, storage_path: str, bucket_name: str = "research-papers") -> str:
        client = self.get_client()
        return client.storage.from_(bucket_name).get_public_url(storage_path)

    def table(self, name: str):
        return self.get_client().table(name)

    def storage_bucket(self, bucket_name: str):
        return self.get_client().storage.from_(bucket_name)


supabase_service = SupabaseService()
