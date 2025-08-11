interface Plug {
  requestConnect: () => Promise<boolean>;
  agent: {
    getPrincipal: () => Promise<{ toText: () => string }>;
  };
}

interface Ic {
  plug: Plug;
}

interface Window {
  ic?: Ic;
}