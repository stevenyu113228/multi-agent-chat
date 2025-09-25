# Makefile for Multi-Agent Chat Application

# Docker commands - All builds and tests run inside Docker

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: dev
dev: ## Start development server in Docker
	docker-compose -f docker-compose.dev.yml up

.PHONY: dev-build
dev-build: ## Build and start development server in Docker
	docker-compose -f docker-compose.dev.yml up --build

.PHONY: dev-stop
dev-stop: ## Stop development server
	docker-compose -f docker-compose.dev.yml down

.PHONY: build
build: ## Build production Docker image
	docker-compose build

.PHONY: prod
prod: ## Start production server in Docker
	docker-compose up -d

.PHONY: prod-stop
prod-stop: ## Stop production server
	docker-compose down

.PHONY: test
test: ## Run tests in Docker container
	docker-compose -f docker-compose.dev.yml run --rm app npm run build

.PHONY: lint
lint: ## Run linting in Docker container
	docker-compose -f docker-compose.dev.yml run --rm app npm run lint

.PHONY: format
format: ## Run code formatting in Docker container
	docker-compose -f docker-compose.dev.yml run --rm app npm run format

.PHONY: shell
shell: ## Open shell in development container
	docker-compose -f docker-compose.dev.yml exec app sh

.PHONY: logs
logs: ## Show Docker logs
	docker-compose logs -f

.PHONY: clean
clean: ## Clean up Docker containers and images
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

.PHONY: rebuild
rebuild: clean build ## Clean and rebuild everything

.PHONY: install
install: ## Install dependencies in Docker container
	docker-compose -f docker-compose.dev.yml run --rm app npm install

.PHONY: ci
ci: ## Run CI pipeline (build, lint, test)
	@echo "🚀 Running CI pipeline in Docker..."
	@$(MAKE) build
	@$(MAKE) lint
	@$(MAKE) test
	@echo "✅ CI pipeline completed successfully!"