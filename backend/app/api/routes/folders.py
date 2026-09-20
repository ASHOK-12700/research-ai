from fastapi import APIRouter, HTTPException, Request, status

from app.api.routes.papers import get_authenticated_user_id
from app.schemas.folders import FolderCreate, FolderListResponse, FolderPaperRequest, FolderResponse, FolderUpdate
from app.services.folder_repository import folder_repository

router = APIRouter(prefix="/folders", tags=["Folders"])


def _user_id(request: Request) -> str:
    try:
        return get_authenticated_user_id(request.headers.get("Authorization"))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


def _response(folder: dict) -> FolderResponse:
    return FolderResponse(**folder)


@router.get("/", response_model=FolderListResponse)
async def list_folders(request: Request) -> FolderListResponse:
    folders = folder_repository.list(_user_id(request))
    return FolderListResponse(folders=[_response(folder) for folder in folders], total=len(folders))


@router.post("/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(request: Request, folder_data: FolderCreate) -> FolderResponse:
    user_id = _user_id(request)
    try:
        return _response(folder_repository.create(user_id, folder_data.name, folder_data.description, folder_data.paper_ids))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Folder could not be created.") from exc


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(request: Request, folder_id: str) -> FolderResponse:
    folder = folder_repository.get(_user_id(request), folder_id)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")
    return _response(folder)


@router.patch("/{folder_id}", response_model=FolderResponse)
async def update_folder(request: Request, folder_id: str, folder_data: FolderUpdate) -> FolderResponse:
    folder = folder_repository.update(_user_id(request), folder_id, folder_data.name, folder_data.description)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")
    return _response(folder)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(request: Request, folder_id: str) -> None:
    if not folder_repository.delete(_user_id(request), folder_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")


@router.post("/{folder_id}/papers", response_model=FolderResponse)
async def add_papers(request: Request, folder_id: str, paper_data: FolderPaperRequest) -> FolderResponse:
    try:
        folder = folder_repository.add_papers(_user_id(request), folder_id, paper_data.paper_ids)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")
    return _response(folder)


@router.delete("/{folder_id}/papers/{paper_id}", response_model=FolderResponse)
async def remove_paper(request: Request, folder_id: str, paper_id: str) -> FolderResponse:
    folder = folder_repository.remove_paper(_user_id(request), folder_id, paper_id)
    if not folder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found.")
    return _response(folder)