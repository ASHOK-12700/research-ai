from datetime import datetime, timezone
from uuid import uuid4

from app.services.supabase_service import supabase_service


class ProjectRepository:
    def create_project(
        self,
        user_id: str,
        title: str,
        topic: str,
        description: str,
        tags: list[str] | None = None,
    ) -> dict:
        """Create a new research project."""
        project_id = str(uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        data = {
            "id": project_id,
            "user_id": user_id,
            "title": title,
            "topic": topic,
            "description": description,
            "tags": tags or [],
            "status": "active",
            "progress": 0,
            "created_at": now,
            "updated_at": now,
        }
        
        response = supabase_service.client.table("projects").insert(data).execute()
        if response.data:
            return response.data[0]
        raise Exception("Failed to create project")

    def get_project(self, user_id: str, project_id: str) -> dict | None:
        """Get a specific project by ID (user-isolated)."""
        response = (
            supabase_service.client.table("projects")
            .select("*, papers(count)")
            .eq("id", project_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if response.data:
            data = response.data
            # Count papers in this project
            paper_count = self._count_papers_in_project(project_id, user_id)
            data["paper_count"] = paper_count
            return data
        return None

    def list_projects(
        self,
        user_id: str,
        status: str | None = None,
        search: str | None = None,
        sort_by: str = "created_at",
    ) -> list[dict]:
        """List all projects for a user with optional filtering."""
        query = supabase_service.client.table("projects").select("*").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
        
        if search:
            search_term = search.lower()
            # Fetch all and filter in Python (Supabase doesn't support OR conditions easily)
            response = query.execute()
            projects = response.data or []
            projects = [
                p for p in projects
                if search_term in p.get("title", "").lower()
                or search_term in p.get("topic", "").lower()
                or search_term in p.get("description", "").lower()
            ]
        else:
            response = query.execute()
            projects = response.data or []
        
        # Add paper counts
        for project in projects:
            project["paper_count"] = self._count_papers_in_project(project["id"], user_id)
        
        # Sort
        if sort_by == "created_at":
            projects.sort(key=lambda p: p.get("created_at", ""), reverse=True)
        elif sort_by == "updated_at":
            projects.sort(key=lambda p: p.get("updated_at", ""), reverse=True)
        elif sort_by == "title":
            projects.sort(key=lambda p: p.get("title", ""))
        elif sort_by == "papers":
            projects.sort(key=lambda p: p.get("paper_count", 0), reverse=True)
        
        return projects

    def update_project(
        self,
        user_id: str,
        project_id: str,
        title: str | None = None,
        topic: str | None = None,
        description: str | None = None,
        tags: list[str] | None = None,
        status: str | None = None,
        progress: int | None = None,
    ) -> dict | None:
        """Update a project (user-isolated)."""
        # Verify ownership
        existing = self.get_project(user_id, project_id)
        if not existing:
            return None
        
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if topic is not None:
            update_data["topic"] = topic
        if description is not None:
            update_data["description"] = description
        if tags is not None:
            update_data["tags"] = tags
        if status is not None:
            update_data["status"] = status
        if progress is not None:
            update_data["progress"] = progress
        
        if not update_data:
            return existing
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        response = (
            supabase_service.client.table("projects")
            .update(update_data)
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )
        
        if response.data:
            data = response.data[0]
            data["paper_count"] = self._count_papers_in_project(project_id, user_id)
            return data
        return None

    def delete_project(self, user_id: str, project_id: str) -> bool:
        """Delete a project (user-isolated). Papers are not deleted, just unlinked."""
        # Unlink papers first
        supabase_service.client.table("papers").update(
            {"project_id": None}
        ).eq("project_id", project_id).eq("user_id", user_id).execute()
        
        # Delete project
        response = (
            supabase_service.client.table("projects")
            .delete()
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )
        return len(response.data) > 0 if response.data else False

    def _count_papers_in_project(self, project_id: str, user_id: str) -> int:
        """Count papers in a project."""
        response = (
            supabase_service.client.table("papers")
            .select("id", count="exact")
            .eq("project_id", project_id)
            .eq("user_id", user_id)
            .execute()
        )
        return response.count or 0


project_repository = ProjectRepository()
