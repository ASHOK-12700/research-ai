from datetime import datetime, timezone
from uuid import uuid4

from app.services.supabase_service import supabase_service


class FolderRepository:
    def _paper_ids(self, folder_id: str, user_id: str) -> list[str]:
        response = (
            supabase_service.table("folder_papers")
            .select("paper_id")
            .eq("folder_id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        return [str(row["paper_id"]) for row in (response.data or [])]

    def _with_papers(self, row: dict, user_id: str) -> dict:
        paper_ids = self._paper_ids(str(row["id"]), user_id)
        return {**row, "paper_ids": paper_ids, "paper_count": len(paper_ids)}

    def list(self, user_id: str) -> list[dict]:
        response = (
            supabase_service.table("folders")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        return [self._with_papers(row, user_id) for row in (response.data or [])]

    def get(self, user_id: str, folder_id: str) -> dict | None:
        response = (
            supabase_service.table("folders")
            .select("*")
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        rows = response.data or []
        return self._with_papers(rows[0], user_id) if rows else None

    def create(self, user_id: str, name: str, description: str, paper_ids: list[str]) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        row = {
            "id": str(uuid4()),
            "user_id": user_id,
            "name": name.strip(),
            "description": description.strip(),
            "created_at": now,
            "updated_at": now,
        }
        response = supabase_service.table("folders").insert(row).execute()
        created = (response.data or [row])[0]
        if paper_ids:
            self.add_papers(user_id, str(created["id"]), paper_ids)
        return self.get(user_id, str(created["id"])) or self._with_papers(created, user_id)

    def update(self, user_id: str, folder_id: str, name: str | None, description: str | None) -> dict | None:
        if not self.get(user_id, folder_id):
            return None
        payload = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if name is not None:
            payload["name"] = name.strip()
        if description is not None:
            payload["description"] = description.strip()
        response = (
            supabase_service.table("folders")
            .update(payload)
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        return self.get(user_id, folder_id) if response.data else None

    def delete(self, user_id: str, folder_id: str) -> bool:
        response = (
            supabase_service.table("folders")
            .delete()
            .eq("id", folder_id)
            .eq("user_id", user_id)
            .execute()
        )
        return bool(response.data)

    def add_papers(self, user_id: str, folder_id: str, paper_ids: list[str]) -> dict | None:
        if not self.get(user_id, folder_id):
            return None
        paper_response = (
            supabase_service.table("papers")
            .select("id")
            .eq("user_id", user_id)
            .in_("id", list(set(paper_ids)))
            .execute()
        )
        valid_ids = [str(row["id"]) for row in (paper_response.data or [])]
        if len(valid_ids) != len(set(paper_ids)):
            raise ValueError("One or more papers are not owned by the authenticated user.")
        rows = [{"folder_id": folder_id, "paper_id": paper_id, "user_id": user_id} for paper_id in valid_ids]
        if rows:
            supabase_service.table("folder_papers").upsert(rows, on_conflict="folder_id,paper_id").execute()
        return self.get(user_id, folder_id)

    def remove_paper(self, user_id: str, folder_id: str, paper_id: str) -> dict | None:
        if not self.get(user_id, folder_id):
            return None
        supabase_service.table("folder_papers").delete().eq("folder_id", folder_id).eq("paper_id", paper_id).eq("user_id", user_id).execute()
        return self.get(user_id, folder_id)


folder_repository = FolderRepository()