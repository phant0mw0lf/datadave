.DEFAULT_GOAL := help
.PHONY: help install dev build preview serve check fmt clean deploy post upgrade

help:  ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install:   ## Install dependencies
	npm install

dev:       ## Start the dev server on :4321
	npm run dev

build:     ## Production build into dist/
	npm run build

preview:   ## Preview the production build via Astro
	npm run preview

serve:     ## Preview the production build via the real Workers runtime
	npx wrangler dev

check:     ## Typecheck + validate content schema, then build
	npx astro check && npm run build

fmt:       ## Format the codebase
	npx prettier --write .

clean:     ## Remove build artifacts
	rm -rf dist .astro node_modules/.vite

deploy:    ## Deploy to Cloudflare manually
	npm run build && npx wrangler deploy

upgrade:   ## Upgrade Astro and its integrations
	npx @astrojs/upgrade

post:      ## Create a new post: make post TITLE="My Title"
	@test -n "$(TITLE)" || { echo "Usage: make post TITLE=\"My Title\""; exit 1; }
	@slug=$$(echo "$(TITLE)" | tr '[:upper:]' '[:lower:]' \
		| sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$$//g'); \
	f="src/content/blog/$$slug.mdx"; \
	test ! -e "$$f" || { echo "Already exists: $$f"; exit 1; }; \
	printf -- '---\ntitle: "%s"\ndescription: ""\npubDate: %s\ntags: []\ndraft: true\n---\n\n' \
		"$(TITLE)" "$$(date +%F)" > "$$f"; \
	echo "Created: $$f"
