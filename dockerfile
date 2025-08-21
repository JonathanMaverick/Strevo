FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json mops.toml ./
RUN npm install

COPY . .


FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update && apt-get install -y curl ca-certificates bash nodejs npm git && \
    npm install -g mops && \
    rm -rf /var/lib/apt/lists/*


RUN DFXVM_INIT_YES=1 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)" && \
    echo 'source $HOME/.local/share/dfx/env' >> /root/.bashrc


COPY --from=build /app ./


EXPOSE 3000 4943

CMD bash -lc "dfx start --background --clean && dfx deploy && npm run setup && npm run start"