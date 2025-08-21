OS := $(shell uname 2>/dev/null || echo Windows)

.PHONY: backend frontend nodejs ai run-all run

backend:
	@echo "Starting backend"
ifeq ($(OS),Linux)
	gnome-terminal -- bash -c "cd $(PWD)/streaming-backend && go run main.go; exec bash"
endif
ifeq ($(OS),Darwin)
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/streaming-backend && go run main.go"'
endif
ifeq ($(OS),Windows)
	start cmd /k "cd $(PWD)\streaming-backend && go run main.go"
endif

frontend:
	@echo "Starting frontend"

ifeq ($(OS),Linux)
	gnome-terminal -- bash -c "cd $(PWD)npm run start; exec bash"
endif

ifeq ($(OS),Darwin)
	osascript -e 'tell application "Terminal" to do script "cd $(PWD) && dfx start"'
	sleep 5
	osascript -e 'tell application "Terminal" to do script "cd $(PWD) && npm run setup && npm run start"'
endif

ifeq ($(OS),Windows)
	start cmd /k "cd $(PWD) && dfx start"
	timeout /t 5
	start cmd /k "cd $(PWD) && npm run setup && npm run start"
endif

nodejs:
	@echo "Starting Node.js project"
ifeq ($(OS),Linux)
	gnome-terminal -- bash -c "cd $(PWD)/streaming-server && npm i && node index.js; exec bash"
endif
ifeq ($(OS),Darwin)
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/streaming-server && npm i && node index.js"'
endif
ifeq ($(OS),Windows)
	start cmd /k "cd $(PWD)\streaming-server && npm i && node index.js"
endif

ai:
	@echo "Starting AI services"

ifeq ($(OS),Linux)
	[ -d "$(PWD)/streaming-ai/.venv" ] || python3 -m venv $(PWD)/streaming-ai/.venv

	gnome-terminal -- bash -c "source $(PWD)/streaming-ai/.venv/bin/activate && pip install -r $(PWD)/streaming-ai/requirements.txt && python3 $(PWD)/streaming-ai/highlight/highlight_agent.py; exec bash"

	gnome-terminal -- bash -c "source $(PWD)/streaming-ai/.venv/bin/activate && pip install -r $(PWD)/streaming-ai/requirements.txt && python3 $(PWD)/streaming-ai/moderator/moderator_agent.py; exec bash"
endif

ifeq ($(OS),Darwin)
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/streaming-ai && pip3.11 install -r requirements.txt && python3.11 highlight/highlight_agent.py"'
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/streaming-ai && pip3.11 install -r requirements.txt && python3.11 moderator/moderator_agent.py"'
endif

ifeq ($(OS),Windows)
	start cmd /k "cd $(PWD)\streaming-ai && pip install -r requirements.txt && python highlight/highlight_agent.py"
	start cmd /k "cd $(PWD)\streaming-ai && pip install -r requirements.txt && python moderator/moderator_agent.py"
endif


run-all: backend frontend nodejs ai
	@echo "All projects started."

run: backend frontend nodejs
	@echo "Project started."