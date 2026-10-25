# Jungle Gaming

Aplicação web de marketplace de NFTs da Jungle Gaming, desenvolvida com React, TanStack Start e Vite.

## Desenvolvimento

Requer Bun.

```sh
bun install
bun run dev
```

Os testes E2E usam Chromium via Google Chrome instalado localmente. Para executá-los, rode
`bun run test:e2e`; o modo interativo está disponível com `bun run test:e2e:ui`. O Playwright inicia
um servidor Vite isolado na porta 4174 e testa a home em viewports desktop e mobile. O relatório HTML
é salvo em `playwright-report/`.

Os mocks ficam ativos por padrão para a demonstração local. Use `VITE_ENABLE_MOCKS=false` para
desativá-los. Para mostrar o painel de cenários sobre a interface, inicie o Vite com
`VITE_SHOW_MOCK_PANEL=true`; ele fica oculto por padrão para não cobrir elementos do design.

## Comandos

```sh
bun run build
bun run lint
bun run test
bun run test:e2e
```
