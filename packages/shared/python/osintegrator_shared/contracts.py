from pathlib import Path

CASE_MODES = ("review", "agent")
CLAIM_STATUSES = ("pending", "approved", "rejected", "provisional")
PRIORITY_STATES = ("required", "preferred", "ignore", "unknown")
PROVIDERS = ("openai", "anthropic", "gemini", "ollama")


def contract_path(name: str) -> Path:
    root = Path(__file__).resolve().parents[2]
    return root / "contracts" / name
