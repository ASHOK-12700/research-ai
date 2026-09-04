from fastapi import APIRouter, HTTPException, Request, status

from app.api.routes.papers import get_authenticated_user_id
from app.schemas.projects import ProjectCreate, ProjectListResponse, ProjectResponse, ProjectUpdate
from app.services.project_repository import project_repository

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(request: Request, project_data: ProjectCreate) -> ProjectResponse:
    """Create a new research project."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    try:
        project = project_repository.create_project(
            user_id=user_id,
            title=project_data.title,
            topic=project_data.topic,
            description=project_data.description,
            tags=project_data.tags,
        )
        return ProjectResponse(**project)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project",
        ) from exc


@router.get("/", response_model=ProjectListResponse)
async def list_projects(
    request: Request,
    status_filter: str | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
) -> ProjectListResponse:
    """List all projects for the authenticated user."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    try:
        projects = project_repository.list_projects(
            user_id=user_id,
            status=status_filter,
            search=search,
            sort_by=sort_by,
        )
        return ProjectListResponse(
            projects=[ProjectResponse(**p) for p in projects],
            total=len(projects),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list projects",
        ) from exc


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(request: Request, project_id: str) -> ProjectResponse:
    """Get a specific project."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    try:
        project = project_repository.get_project(user_id=user_id, project_id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return ProjectResponse(**project)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get project",
        ) from exc


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    request: Request,
    project_id: str,
    project_data: ProjectUpdate,
) -> ProjectResponse:
    """Update a project."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    try:
        project = project_repository.update_project(
            user_id=user_id,
            project_id=project_id,
            title=project_data.title,
            topic=project_data.topic,
            description=project_data.description,
            tags=project_data.tags,
            status=project_data.status,
            progress=project_data.progress,
        )
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return ProjectResponse(**project)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update project",
        ) from exc


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(request: Request, project_id: str) -> None:
    """Delete a project."""
    try:
        user_id = get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    try:
        success = project_repository.delete_project(user_id=user_id, project_id=project_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete project",
        ) from exc
