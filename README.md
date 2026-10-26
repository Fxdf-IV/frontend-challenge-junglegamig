# Kurio — NFT Marketplace

Aplicação web de marketplace de NFTs construída com React 19, TypeScript estrito, TanStack Router, TanStack Query, Axios, Tailwind CSS, shadcn/ui, Socket.IO e MSW (Mock Service Worker).

Documentação complementar:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — contratos REST, eventos Socket.IO, política de sessão, cache/retries, reconciliação em tempo real, transporte MSW e decisões de UX.
- [`docs/FIGMA-DEVIATIONS.md`](./docs/FIGMA-DEVIATIONS.md) — registro detalhado das correções e complementos em relação ao Figma (`FD-01` a `FD-15`).
- [`docs/REQUISITOS-COBERTURA.md`](./docs/REQUISITOS-COBERTURA.md) — matriz de rastreabilidade item a item dos requisitos e provas automatizadas.

---

## Prévia visual e telas da plataforma

Confira abaixo as principais telas e fluxos completos desenvolvidos na plataforma:

### 1. Início e Catálogo de Coleções

> Banner hero com contagem regressiva para oferta limitada, navegação por categorias, filtros multifacetados por rede e faixa de preço em ETH, ordenação dinâmica e paginação.

![Início e Banner Hero](docs/screenshots/01-home-hero.png)

![Catálogo com Filtros de Preço e Rede](docs/screenshots/02-catalog-filters.png)

### 2. Detalhes do Ativo & Seletor de Edições

> Visualização da obra em alta resolução, histórico de valorização em gráfico interativo, atributos e raridade no IPFS, seletor de edições (1/1, 1/10, 1/50 e aberta) e ações de compra e favoritar.

![Detalhes do NFT e Seleção de Edição](docs/screenshots/03-nft-detail.png)

### 3. Carrinho de Compras e Resumo Financeiro

> Gestão de múltiplos itens com alteração de quantidade em tempo real, aplicação de cupom promocional (`KURIO10`), cálculo de taxas de rede e estimativas em ETH com precisão decimal.

![Carrinho de Compras com Cupom Aplicado](docs/screenshots/04-cart.png)

### 4. Checkout Web3, Revisão e Confirmação da Transação

> Conexão simulada de carteira Web3 (MetaMask/Ethereum), modal de revisão com proteção contra oscilação de cotação e recibo oficial emitido com ID da transação após confirmação na rede.

|                   Checkout e Carteira Conectada                    |                 Modal de Revisão do Pedido                 |
| :----------------------------------------------------------------: | :--------------------------------------------------------: |
| ![Checkout e Carteira Conectada](docs/screenshots/05-checkout.png) | ![Revisão do Pedido](docs/screenshots/06-order-review.png) |

|               Recibo e Confirmação da Transação               |         Lista de Favoritos Sincronizada         |
| :-----------------------------------------------------------: | :---------------------------------------------: |
| ![Recibo da Transação](docs/screenshots/07-order-receipt.png) | ![Favoritos](docs/screenshots/10-favorites.png) |

### 5. Painel de Simulação (MSW / Socket.IO) e Responsividade Mobile

> Painel lateral de testes determinísticos para simular 13 cenários de rede (offline, jitter, flutuação de preço, timeout, 503) e disparar eventos Socket.IO em tempo real. Interface 100% responsiva (390px, 768px e 1440px) sem overflow horizontal.

|              Painel de Simulação (MSW & Socket.IO)               |                    Experiência Mobile (390px)                     |
| :--------------------------------------------------------------: | :---------------------------------------------------------------: |
| ![Painel de Simulação](docs/screenshots/11-simulation-panel.png) | ![Visualização Mobile](docs/screenshots/12-mobile-responsive.png) |

### 6. Perfil e Gestão de Múltiplas Carteiras

> Edição de dados do colecionador (nome de exibição, domínio ENS `.eth`, avatar e alteração de senha segura) e gerenciamento de carteira primária e secundárias por rede.

|           Dados do Perfil do Colecionador           |                   Gestão de Carteiras                   |
| :-------------------------------------------------: | :-----------------------------------------------------: |
| ![Dados do Perfil](docs/screenshots/08-profile.png) | ![Gestão de Carteiras](docs/screenshots/09-wallets.png) |

---

## 1. Requisitos e instalação

Requer [Bun](https://bun.sh/) (v1.1+) e Google Chrome instalado localmente para execução dos testes E2E Playwright e auditorias Lighthouse.

```sh
bun install
bun run dev
```

O servidor de desenvolvimento inicia com os mocks REST e Socket.IO ativos por padrão.

---

## 2. Variáveis de ambiente

As variáveis abaixo têm valores padrão seguros para execução local e build de demonstração (nenhum arquivo `.env` obrigatório para rodar o projeto):

| Variável               | Padrão                                | Descrição                                                                                                                                 |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ENABLE_MOCKS`    | `"true"` (ativo quando `!== "false"`) | Ativa o Service Worker do MSW e o servidor Socket.IO simulado no navegador, inclusive em `vite build` / `vite preview`.                   |
| `VITE_SHOW_MOCK_PANEL` | `"false"`                             | Quando `"true"`, exibe o botão flutuante **Cenários** para alternar cenários determinísticos e disparar eventos Socket.IO pela interface. |
| `VITE_API_URL`         | `"/api"`                              | Prefixo base usado pelo cliente Axios (`src/api/client.ts`).                                                                              |

Para iniciar o servidor de desenvolvimento com o painel visual de simulação aberto:

```sh
VITE_SHOW_MOCK_PANEL=true bun run dev
```

No PowerShell (Windows):

```powershell
$env:VITE_SHOW_MOCK_PANEL="true"; bun run dev
```

---

## 3. Credenciais fictícias e cupons de teste

### Contas pré-cadastradas

| Usuário        | E-mail            | Senha       | Características iniciais                                                                                                                 |
| -------------- | ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Ana Sato**   | `ana@kurio.dev`   | `Kurio@123` | Possui favorito inicial (`emerald-ape-042`), metadados ENS (`ana.eth`) e carteira inicial cadastrada (Ethereum MetaMask "Reserva").      |
| **Bruno Lima** | `bruno@kurio.dev` | `Kurio@123` | Conta limpa (sem favoritos nem carteiras iniciais) para testar estados vazios, primeiro cadastro de carteira e isolamento entre sessões. |

### Cupons promocionais

| Código                             | Comportamento                                                             |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `KURIO10`                          | Válido — aplica **10% de desconto** (`1000 bps`) sobre o subtotal em ETH. |
| `WELCOME5`                         | Válido — aplica **5% de desconto** (`500 bps`) sobre o subtotal em ETH.   |
| `VERAO25`                          | Expirado — retorna erro `422 COUPON_EXPIRED` (`"Este cupom expirou"`).    |
| Qualquer outro (ex.: `INVALIDO99`) | Inválido — retorna erro `422 COUPON_INVALID` (`"Cupom inválido"`).        |

---

## 4. Seleção e reset de cenários determinísticos

Os cenários de rede e de negócio podem ser selecionados de três formas:

1. **Pela URL (`?scenario=<id>`):** adicione `?scenario=<id>` ao abrir qualquer rota (ex.: `/?scenario=slow`, `/?scenario=empty`, `/login?scenario=price-change`). O inicializador do MSW aplica o cenário e reseta os contadores antes de atender a primeira requisição da página.
2. **Pelo painel de simulação (`Cenários`):** acesse qualquer rota com `?panel=true` ou `?cenarios=true` (ex.: `https://frontend-challenge-junglegamig.vercel.app/?panel=true`) ou inicie localmente com `VITE_SHOW_MOCK_PANEL=true`. Um botão flutuante **Cenários** surgirá no canto inferior esquerdo para alternar cenários em tempo real, disparar eventos Socket.IO ou clicar em **Restaurar dados iniciais**. A preferência fica gravada no navegador (`?panel=false` para ocultar).
3. **Por endpoint de controle (testes):** `POST /api/__mock/reset` (opcionalmente com `{ "scenario": "<id>" }`) restaura o banco determinístico no `localStorage`, e `POST /api/__mock/scenario` altera apenas o cenário ativo sem apagar sessão ou carrinho.

### Como reproduzir cada cenário e falha

| Cenário (`?scenario=`)                    | O que simula e como reproduzir                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default`                                 | Operação normal com latência realista (120–300 ms), confirmações de pedido em ~2,5 s via Socket.IO.                                                                                                                                                                                                                            |
| `empty`                                   | Acesse `/?scenario=empty`: o catálogo retorna zero itens para validar o estado vazio e ação de limpeza.                                                                                                                                                                                                                        |
| `slow`                                    | Acesse `/?scenario=slow`: todas as respostas demoram 1,8 s, permitindo inspecionar os skeletons `.shimmer` no catálogo, detalhe e resumo do carrinho.                                                                                                                                                                          |
| `jitter`                                  | Acesse `/?scenario=jitter`: respostas com latência variável (100–1500 ms) fora de ordem; troque rapidamente filtros/abas para observar o descarte de respostas obsoletas.                                                                                                                                                      |
| `flaky`                                   | Acesse `/?scenario=flaky`: 1 a cada 3 requisições retorna `503 UNAVAILABLE`, exercitando o retry automático do TanStack Query em falhas transitórias.                                                                                                                                                                          |
| `offline`                                 | Acesse `/?scenario=offline`: simula falha de conexão de rede (`NETWORK`) em todas as chamadas.                                                                                                                                                                                                                                 |
| `server-error`                            | Acesse `/?scenario=server-error`: `GET /api/nfts` retorna `500 SERVER_ERROR`; volte para `default` no painel e clique em **Tentar novamente** para recuperar a listagem.                                                                                                                                                       |
| `session-expired`                         | Faça login em `/login?scenario=session-expired`: a sessão recebe TTL curto (20 s). Ao expirar durante uma ação privada, o app limpa o cache privado e redireciona para `/login?redirect=...&expired=true` preservando o rascunho do checkout.                                                                                  |
| `favorite-fail`                           | Autenticado, acesse `/?scenario=favorite-fail` e clique em favoritar: a UI atualiza otimisticamente e faz rollback automático ao receber `500 SERVER_ERROR` com aviso acessível.                                                                                                                                               |
| `price-change`                            | Adicione um NFT ao carrinho sob `price-change`, vá ao `/checkout`, conecte a carteira, abra **Revisar pedido** e clique em **Confirmar compra**: o preço sobe `+0.10 ETH` antes de fechar, retornando `409 QUOTE_STALE` e exigindo clicar em **Confirmar novos valores**.                                                      |
| `sold-out`                                | Mesmo fluxo acima sob `sold-out`: a edição esgota antes da confirmação (`409 AVAILABILITY`), exibe alerta de item esgotado e bloqueia o botão de confirmação.                                                                                                                                                                  |
| `order-timeout`                           | No modal de revisão sob `order-timeout`, clique em **Confirmar compra**: a primeira requisição excede o timeout de 8 s do cliente, exibindo aviso de timeout; clicar em **Tentar novamente** reutiliza a mesma `Idempotency-Key` e recupera o pedido sem duplicá-lo.                                                           |
| `payment-declined`                        | Confirme uma compra sob `payment-declined`: o pedido inicia `pending` e transita para `declined` (Pagamento recusado), preservando os itens originais no carrinho.                                                                                                                                                             |
| **Eventos Socket.IO** (painel `Cenários`) | Com um item no carrinho ou na revisão do checkout, use os botões **+0,05 ETH no 1º item**, **Esgotar 1º item**, **Reenviar último evento (duplicado)**, **Enviar evento antigo** e **Derrubar conexão (3 s)** para testar atualização em tempo real, deduplicação por `eventId`/`version` e reconciliação REST após reconexão. |

---

## 5. Comandos disponíveis

```sh
# Servidor de desenvolvimento (Vite)
bun run dev

# Verificação de tipos TypeScript (tsc --noEmit)
bun run typecheck

# Lint do projeto (ESLint + Prettier)
bun run lint

# Formatação de código (Prettier)
bun run format

# Testes unitários e de integração (Vitest)
bun run test
bun run test:watch

# Build de produção e servidor de preview
bun run build
bun run preview

# Testes E2E (Playwright — Chromium Desktop 1440×1000 e Mobile 390×844)
bun run test:e2e
bun run test:e2e:ui

# Executar testes E2E sobre o build compilado de produção (preview)
PLAYWRIGHT_PREVIEW=1 bun run test:e2e

# Auditoria de performance, acessibilidade, boas práticas e SEO (Lighthouse)
bun run lighthouse
```

---

## 6. Deploy público

A aplicação usa SSR com TanStack Start e Nitro. Na Vercel, `vercel.json` declara o framework
`tanstack-start`, e o adaptador Nitro detecta o ambiente para gerar a função de servidor e os
assets no formato nativo da plataforma. Não configure `.output/public` como diretório de saída
estático nem reescreva todas as rotas para `/`: isso remove o servidor SSR do deploy e quebra o
acesso direto a páginas como `/nft/emerald-ape-042`.

Produção: [https://frontend-challenge-junglegamig.vercel.app/](https://frontend-challenge-junglegamig.vercel.app/).

Os mocks MSW e o transporte de tempo real operam no cliente também na versão publicada. Em hosts
estáticos, `public/_redirects` contém uma regra SPA, mas o build padrão deste projeto é SSR; use
uma integração de servidor compatível com TanStack Start/Nitro para publicar esse build.
