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

## 7. Configure AI providers

AI requests use the providers in this order: Groq, OpenRouter, then Mistral. If a configured provider times out, fails, or returns no content, the next provider is tried.

Set these variables in `backend/.env` or your deployment provider's secret settings:

```env
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-120b
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=deepseek/deepseek-chat:free
MISTRAL_API_KEY=your_mistral_key
MISTRAL_MODEL=mistral-medium-latest
```

At least one provider key and model must be configured. Never commit real API keys.

## 8. Test the health endpoint

Open:

http://localhost:8000/api/health

You should receive a JSON response with `status`, `service`, and `version`.
