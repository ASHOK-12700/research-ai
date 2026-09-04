# ResearchAI Backend

This folder contains the Phase 1 FastAPI foundation for ResearchAI. It is intentionally small and modular so later phases can add papers, projects, summaries, chat, citations, and research-gap features without restructuring the app.

## 1. Create a virtual environment

Open PowerShell in the `backend` folder and run:

```powershell
python -m venv .venv
```

## 2. Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, run:

```powershell
Set-ExecutionPolicy -Scope Process RemoteSigned
```

then activate the environment again.

## 3. Install requirements

```powershell
pip install -r requirements.txt
```

Reproducible setup note:

- Keep all backend dependencies isolated in `backend/.venv`.
- Install or upgrade packages only after activating `.venv`.
- If you need a clean reinstall, remove `.venv`, recreate it, then run `pip install -r requirements.txt` again.

## 4. Create `.env`

Copy `.env.example` to `.env` and keep the values local.

```powershell
Copy-Item .env.example .env
```

## 5. Start FastAPI

```powershell
uvicorn app.main:app --reload --port 8000
```

## 6. Open Swagger documentation

Visit:

http://localhost:8000/docs

## 7. Optional: configure AI summarization

This project supports structured paper summarization through the NVIDIA NIM hosted API using an OpenAI-compatible request format.

Required environment variable:

- `NVIDIA_API_KEY`

Optional environment variables:

- `AI_MODEL` (default: `meta/llama-3.2-3b-instruct`)
- `NVIDIA_BASE_URL` (default: `https://integrate.api.nvidia.com/v1`)

Add them to a local `.env` file in the `backend` folder, for example:

```env
NVIDIA_API_KEY=your_key_here
AI_MODEL=meta/llama-3.2-3b-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

If no API key is configured, the summarization endpoint returns a clear configuration error and does not use any hardcoded key.

## 8. Test the health endpoint

Open:

http://localhost:8000/api/health

You should receive a JSON response with `status`, `service`, and `version`.
