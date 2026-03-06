.PHONY: build test lint run docker-build help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build for production
	npx next build

test: ## Lint and run tests
	$(MAKE) lint
	npx vitest run

lint: ## Lint and check formatting
	npx eslint .
	npx prettier --check .

run: ## Start Next.js dev server
	npx next dev -p 3847

docker-build: ## Build Docker image
	docker build -t nextlake-conference .
