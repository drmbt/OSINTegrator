SHELL := /bin/zsh

.PHONY: install api desktop docker-check check

install:
	pnpm install

api:
	cd apps/api && python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

desktop:
	pnpm --dir apps/desktop dev

docker-check:
	if command -v docker >/dev/null 2>&1; then docker compose -f infra/docker-compose.yml config; else echo "Docker CLI not installed; skipping compose validation."; fi

check:
	pnpm check
