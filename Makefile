COMPOSE := docker compose -f infra/docker/docker-compose.yml

.PHONY: help portal-dev portal-test go-test rust-test compose-up compose-down

help:
	@printf "portal-dev\nportal-test\ngo-test\nrust-test\ncompose-up\ncompose-down\n"

portal-dev:
	npm run dev --workspace @titlechain/portal

portal-test:
	npm run test --workspace @titlechain/portal

go-test:
	cd services/api && go test ./...

rust-test:
	cargo test --workspace

compose-up:
	$(COMPOSE) up --build

compose-down:
	$(COMPOSE) down -v
