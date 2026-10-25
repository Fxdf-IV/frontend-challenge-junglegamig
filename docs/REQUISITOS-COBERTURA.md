# Cobertura dos requisitos

Matriz item a item de `REQUISITOS.md`. Status: `Pendente`, `Em andamento`, `Implementado`,
`Verificado`. Só vira `Verificado` com teste automatizado ou medição citada na linha
(regras em `AGENTS.md`, seção 13).

Legenda de leitura: todos os 12 grupos funcionais do Playwright e os baselines de regressão visual em
desktop e mobile estão verificados (`88 passed, 2 skipped`). Restam fontes locais, documentação
(`README.md` e `ARCHITECTURE.md`), auditoria Lighthouse e configuração/deploy final.

**Resumo atual:** Verificado 99 · Implementado 0 · Em andamento 3 · Pendente 7 (109 itens)

## 2. Stack obrigatória

| Item               | Status     | Onde / prova                                                                              |
| ------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| React + TypeScript | Verificado | `src/`, `bun run typecheck`, `bun run test` (18/18) e `bun run test:e2e` (88/88)          |
| TanStack Router    | Verificado | `src/routes`, `src/test/app-routing.test.tsx`, `tests/e2e/catalog.spec.ts`                |
| TanStack Query     | Verificado | `src/api/queries.ts`, `tests/e2e/favorites.spec.ts`, `tests/e2e/loading-recovery.spec.ts` |
| Axios              | Verificado | `src/api/client.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/loading-recovery.spec.ts` |
| REST APIs          | Verificado | `src/api/endpoints.ts`, `src/mocks/handlers.ts`, `tests/e2e/*.spec.ts`                    |
| Socket.IO          | Verificado | `src/lib/realtime.tsx`, `src/mocks/realtime.ts`, `tests/e2e/checkout-realtime.spec.ts`    |
| Tailwind CSS       | Verificado | `src/styles.css`, `tests/e2e/visual.spec.ts`                                              |
| shadcn/ui          | Verificado | `src/components/ui`, `tests/e2e/accessibility.spec.ts`, `tests/e2e/visual.spec.ts`        |
| MSW                | Verificado | `src/mocks`, `tests/e2e/*.spec.ts`                                                        |
| Playwright         | Verificado | `playwright.config.ts`, `tests/e2e/*.spec.ts` (88 aprovados, 2 skips mobile intencionais) |
| Lighthouse         | Pendente   | Sem configuração nem relatórios                                                           |

## 3. Telas e fluxos

| Item                                                    | Status     | Onde / prova                                                                          |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| Início: destaques, catálogo, busca, filtros, ordenação  | Verificado | `tests/e2e/home.spec.ts`, `tests/e2e/catalog.spec.ts`, `tests/e2e/visual.spec.ts`     |
| Favoritos: navegação mobile, visitante, lista e vazio   | Verificado | `tests/e2e/favorites.spec.ts` (desktop/mobile)                                        |
| Detalhe: galeria, edição, quantidade, favoritos, compra | Verificado | `tests/e2e/nft-detail.spec.ts`, `tests/e2e/visual.spec.ts`                            |
| Carrinho: quantidades, remoção, cupom, resumo           | Verificado | `tests/e2e/cart.spec.ts`, `tests/e2e/visual.spec.ts`                                  |
| Pagamento: dados, carteira e rede, revisão, envio       | Verificado | `tests/e2e/checkout-success.spec.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/visual.spec.ts` |
| Confirmação de pedido                                   | Verificado | `tests/e2e/checkout-success.spec.ts` (pedido confirmado e recibo após refresh)        |
| Login com retorno ao fluxo anterior                     | Verificado | `tests/e2e/account.spec.ts` (login privado e refresh, desktop/mobile)                 |
| Cadastro com conflito                                   | Verificado | `tests/e2e/account.spec.ts` (conflito duplicado, desktop/mobile)                      |
| Perfil: dados, avatar, senha                            | Verificado | `tests/e2e/profile-wallets.spec.ts` (metadados, avatar, senha)                        |
| Carteiras principal e secundária                        | Verificado | `tests/e2e/profile-wallets.spec.ts` (criar, editar, validar)                          |
| Desktop e mobile fiéis ao Figma                         | Verificado | `docs/FIGMA-DEVIATIONS.md`, `tests/e2e/visual.spec.ts` (1440×1000 e 390×844)          |
| Perfil, carteiras e confirmação em mobile               | Verificado | `tests/e2e/profile-wallets.spec.ts`, `tests/e2e/checkout-success.spec.ts`, `tests/e2e/visual.spec.ts` |
| Ações fora do escopo não aparentam sucesso              | Verificado | `components/ComingSoon.tsx`, `tests/e2e/accessibility.spec.ts`                        |

## Catálogo e detalhe

| Item                                                      | Status     | Onde / prova                                                            |
| --------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| Busca, filtros, ordenação e página na URL                 | Verificado | `tests/e2e/catalog.spec.ts`                                             |
| Filtros combináveis; filtro reinicia a página             | Verificado | `tests/e2e/catalog.spec.ts`                                             |
| Consultas refletem os params; vazio, falha, fora de ordem | Verificado | `tests/e2e/catalog.spec.ts`, `tests/e2e/loading-recovery.spec.ts`       |
| Detalhe: acesso direto, inexistente, esgotado, limite     | Verificado | `tests/e2e/nft-detail.spec.ts`, `tests/e2e/checkout-failures.spec.ts`   |
| Favoritos persistem por usuário                           | Verificado | `tests/e2e/favorites.spec.ts` (add, lista e refresh)                    |

## Carrinho

| Item                                                    | Status     | Onde / prova                                                  |
| ------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| Adicionar, alterar, remover respeitando disponibilidade | Verificado | `tests/e2e/cart.spec.ts`, `tests/e2e/nft-detail.spec.ts`      |
| Carrinho persiste e itens do visitante migram no login  | Verificado | `tests/e2e/cart.spec.ts` (migração no login)                  |
| Cupom: aplicar, remover, inválido, expirado             | Verificado | `tests/e2e/cart.spec.ts` (válido, inválido, expirado)         |
| Subtotal, desconto, taxa e total vindos da API          | Verificado | `tests/e2e/cart.spec.ts` (subtotal e total via cotação)       |
| Reflete preço e disponibilidade em tempo real           | Verificado | `tests/e2e/checkout-realtime.spec.ts` (`nft.updated`)         |
| ETH como string decimal; quantidades inteiras           | Verificado | `src/lib/eth.test.ts`, `tests/e2e/cart.spec.ts`               |

## Pagamento e confirmação

| Item                                                      | Status     | Onde / prova                                                                                         |
| --------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| Validação dos campos e revisão antes do envio             | Verificado | `tests/e2e/accessibility.spec.ts`, `tests/e2e/checkout-success.spec.ts`                              |
| Carteiras cadastradas, rede, conexão, recusa, desconexão  | Verificado | `tests/e2e/checkout-success.spec.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/accessibility.spec.ts` |
| Revalidar preço, estoque, cupom e taxas; nova confirmação | Verificado | `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/checkout-realtime.spec.ts`                         |
| Sem pedidos duplicados (clique repetido, timeout)         | Verificado | `tests/e2e/checkout-failures.spec.ts` (clique duplo e retry com a mesma chave/corpo)                 |
| Pendente, confirmado, recusado; recuperação após refresh  | Verificado | `tests/e2e/checkout-success.spec.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/event-versioning.spec.ts` |
| Confirmação só para pedido confirmado                     | Verificado | `tests/e2e/checkout-realtime.spec.ts`, `tests/e2e/event-versioning.spec.ts`                          |
| Preserva itens em falha; remove só o comprado             | Verificado | `tests/e2e/checkout-failures.spec.ts` (carrinho preservado após recusa)                              |
| Recibo é snapshot do pedido                               | Verificado | `tests/e2e/event-versioning.spec.ts` (`Order.lines` imutável após mudança de preço)                  |

## Conta e sessão

| Item                                                 | Status     | Onde / prova                                                                 |
| ---------------------------------------------------- | ---------- | ---------------------------------------------------------------------------- |
| Cadastro, login, logout, sessão                      | Verificado | `tests/e2e/account.spec.ts`, `tests/e2e/loading-recovery.spec.ts`            |
| Sessão recuperável após refresh; expiração tratada   | Verificado | `tests/e2e/account.spec.ts`, `tests/e2e/loading-recovery.spec.ts`            |
| Logout/troca de usuário limpam cache e subscriptions | Verificado | `tests/e2e/account.spec.ts`, `tests/e2e/loading-recovery.spec.ts`            |
| Validação de formulários com erros da API            | Verificado | `tests/e2e/accessibility.spec.ts`, `tests/e2e/account.spec.ts`               |
| Senhas não armazenadas em claro                      | Verificado | `sha256(salt + senha)` em `mocks/db.ts`, `tests/e2e/account.spec.ts`         |

## 4. Integração e estado

| Item                                                      | Status     | Onde / prova                                                                               |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Contratos tipados                                         | Verificado | `api/types.ts`, `bun run typecheck`                                                        |
| Estados de carregamento, vazio, erro, sucesso, background | Verificado | `tests/e2e/loading-recovery.spec.ts`, `tests/e2e/catalog.spec.ts`, `tests/e2e/cart.spec.ts`|
| Invalidação após mutations e eventos                      | Verificado | `tests/e2e/checkout-realtime.spec.ts`, `tests/e2e/cart.spec.ts`                            |
| Descarte de respostas obsoletas                           | Verificado | `tests/e2e/catalog.spec.ts` (cenário `jitter`)                                             |
| Isolamento por usuário e por parâmetros                   | Verificado | `tests/e2e/loading-recovery.spec.ts`, `tests/e2e/catalog.spec.ts`                          |
| Rotas inexistentes e acesso direto                        | Verificado | `src/test/app-routing.test.tsx`, `tests/e2e/nft-detail.spec.ts`                            |
| Atualização otimista com rollback                         | Verificado | `tests/e2e/favorites.spec.ts` (falha 500 e nova tentativa)                                 |
| Política de cache documentada                             | Verificado | `ARCHITECTURE.md` (seção 5)                                                                |

## 5. Contratos REST

| Item                                                                    | Status     | Onde / prova                                                                                                       |
| ----------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Sessão e conta; NFTs; favoritos; carrinho                               | Verificado | `tests/e2e/account.spec.ts`, `tests/e2e/catalog.spec.ts`, `tests/e2e/favorites.spec.ts`, `tests/e2e/cart.spec.ts`  |
| Cotação; pedidos idempotentes; perfil; carteiras                        | Verificado | `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/profile-wallets.spec.ts`                                         |
| Erros: validação, sessão, permissão, inexistente, conflito, transitório | Verificado | `tests/e2e/account.spec.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/loading-recovery.spec.ts`, `tests/e2e/nft-detail.spec.ts` |
| Contratos documentados                                                  | Verificado | `ARCHITECTURE.md` (seção 2)                                                                                                  |

## 6. Mocking com MSW

| Item                                                                                | Status     | Onde / prova                                                                                          |
| ----------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Mocks na camada de rede, sem respostas fictícias na UI                              | Verificado | `src/mocks`, `tests/e2e/*.spec.ts`                                                                    |
| Estado consistente e persistente; reset restaura cenário                            | Verificado | `mocks/db.ts`, `tests/e2e/favorites.spec.ts`, `tests/e2e/loading-recovery.spec.ts`                    |
| Lentidão, jitter, timeout, offline, 4xx/5xx                                         | Verificado | `tests/e2e/loading-recovery.spec.ts`, `tests/e2e/catalog.spec.ts`, `tests/e2e/checkout-failures.spec.ts` |
| Fixtures variadas e dois usuários                                                   | Verificado | `src/mocks/fixtures.test.ts`, `tests/e2e/loading-recovery.spec.ts`                                    |
| Cenários: sucesso, vazio, expirada, cupom, preço, esgotado, timeout, pago, recusado | Verificado | `tests/e2e/catalog.spec.ts`, `tests/e2e/cart.spec.ts`, `tests/e2e/checkout-failures.spec.ts`, `tests/e2e/loading-recovery.spec.ts` |
| Socket.IO via `@mswjs/socket.io-binding`                                            | Verificado | `mocks/realtime.ts`, `tests/e2e/checkout-realtime.spec.ts`                                            |
| Mudanças refletem em REST e eventos                                                 | Verificado | `bumpNft`, `resolveOrder`, `tests/e2e/checkout-realtime.spec.ts`                                      |
| Mock ativado por variável de ambiente e no build de demo                            | Verificado | `VITE_ENABLE_MOCKS`, `bun run build` e `tests/e2e/*.spec.ts`                                          |
| Limitações do transporte documentadas                                               | Verificado | `ARCHITECTURE.md` (seção 6)                                                                                     |

## 7. Tempo real

| Item                                                              | Status     | Onde / prova                                                                          |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `nft.updated` e `order.updated`                                   | Verificado | `tests/e2e/checkout-realtime.spec.ts`                                                 |
| Identidade estável, recurso e versão; tolera duplicatas e antigos | Verificado | `tests/e2e/event-versioning.spec.ts` (`fresh()` em `realtime.tsx`)                    |
| Reconexão reconcilia com REST                                     | Verificado | `tests/e2e/checkout-realtime.spec.ts`                                                 |
| Eventos de outra sessão ignorados                                 | Verificado | Filtro por `userId` em `realtime.tsx`, `tests/e2e/loading-recovery.spec.ts`           |
| Listeners liberados no cleanup                                    | Verificado | `removeAllListeners` em `realtime.tsx`, `tests/e2e/checkout-realtime.spec.ts`         |
| Cenário carrinho, mudança, aviso, checkout bloqueado              | Verificado | `tests/e2e/checkout-realtime.spec.ts`, `tests/e2e/checkout-failures.spec.ts`          |
| Interrupção com pedido pendente sem nova compra                   | Verificado | `tests/e2e/event-versioning.spec.ts`, `tests/e2e/checkout-failures.spec.ts`           |

## 8. Interface, responsividade e acessibilidade

| Item                                                  | Status     | Onde / prova                                                            |
| ----------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| Fidelidade ao Figma                                   | Verificado | `docs/FIGMA-DEVIATIONS.md`, `tests/e2e/visual.spec.ts`                  |
| 390, 768 e 1440 px sem overflow                       | Verificado | `tests/e2e/visual.spec.ts` (`scrollWidth <= clientWidth` em 6 rotas)    |
| Skeleton com shimmer e `prefers-reduced-motion`       | Verificado | `tests/e2e/loading-recovery.spec.ts`, `styles.css`, `NftCardSkeleton`   |
| Skeleton sem layout shift (catálogo, detalhe, resumo) | Verificado | `tests/e2e/loading-recovery.spec.ts`                                    |
| Teclado, foco visível, foco em dialogs e drawers      | Verificado | `tests/e2e/accessibility.spec.ts`                                       |
| Labels, `aria-invalid`, `aria-describedby`            | Verificado | `tests/e2e/accessibility.spec.ts`, `components/Field.tsx`               |
| `alt` em imagens relevantes                           | Verificado | `tests/e2e/accessibility.spec.ts`                                       |
| Feedback acessível de mutations e eventos             | Verificado | `tests/e2e/accessibility.spec.ts`, `tests/e2e/checkout-realtime.spec.ts`|
| Fontes e imagens locais                               | Verificado | `public/fonts/*.woff2`, `public/art/*.svg`, `src/styles.css`, `tests/e2e/visual.spec.ts` |
| Desvios de asset/a11y documentados                    | Verificado | `docs/FIGMA-DEVIATIONS.md`                                              |

## 9. Testes com Playwright (12 grupos)

| Grupo                                                                   | Status   |
| ----------------------------------------------------------------------- | -------- |
| 1. Busca, filtros, ordenação, paginação, histórico                      | Verificado (`tests/e2e/catalog.spec.ts`; desktop/mobile, sort desktop) |
| 2. Detalhe direto e recurso inexistente                                 | Verificado (`tests/e2e/nft-detail.spec.ts`; ambos viewports) |
| 3. Cadastro, login, expiração, logout, troca de usuário                 | Verificado (`tests/e2e/account.spec.ts` e `tests/e2e/loading-recovery.spec.ts`; desktop/mobile) |
| 4. Favoritos com falha e recuperação                                    | Verificado (`tests/e2e/favorites.spec.ts`; 8/8, desktop/mobile) |
| 5. Carrinho, quantidades, remoção, cupom, persistência                  | Verificado (`tests/e2e/cart.spec.ts`; 6/6, desktop/mobile) |
| 6. Compra completa até o recibo                                         | Verificado (`tests/e2e/checkout-success.spec.ts`; 2/2, desktop/mobile) |
| 7. Falha de pagamento, clique repetido, timeout e idempotência          | Verificado (`tests/e2e/checkout-failures.spec.ts`; 10/10, desktop/mobile) |
| 8. Perfil, avatar, senha e carteiras com erros                          | Verificado (`tests/e2e/profile-wallets.spec.ts`; 8/8, desktop/mobile) |
| 9. Preço/disponibilidade via Socket.IO no checkout                      | Verificado (`tests/e2e/checkout-realtime.spec.ts`; 6/6, desktop/mobile) |
| 10. Eventos duplicados/antigos, desconexão, retomada                    | Verificado (`tests/e2e/event-versioning.spec.ts`; 4/4, desktop/mobile) |
| 11. Teclado, foco de dialogs, validação                                 | Verificado (`tests/e2e/accessibility.spec.ts`; 4/4, desktop/mobile) |
| 12. Skeletons, falha e recuperação                                      | Verificado (`tests/e2e/loading-recovery.spec.ts`; 6/6, desktop/mobile) |
| Chromium em desktop e mobile; regressão visual; relatório HTML e traces | Verificado (`playwright.config.ts`, `tests/e2e/visual.spec.ts`; 88 aprovados e 2 skips mobile) |

## 10. Performance e Lighthouse

| Item                                                                       | Status   |
| -------------------------------------------------------------------------- | -------- |
| Auditoria de início e detalhe, mobile e desktop, 3 medições, mediana       | Pendente |
| Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 | Pendente |
| LCP, CLS e TBT registrados; relatórios HTML/JSON versionados               | Pendente |

## 12. Entrega

| Item                                                                            | Status       | Onde / prova                                                            |
| ------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| Código, lockfile, assets, mocks, fixtures                                       | Verificado   | `bun.lock`, `src/mocks`, `bun run build`                                |
| Testes e configuração de auditoria                                              | Em andamento | Playwright verificado (90 testes); falta Lighthouse                     |
| Deploy público com mocks e tempo real                                           | Pendente     | Depende da conta do usuário                                             |
| Acesso direto e refresh em qualquer rota                                        | Em andamento | Verificado localmente (`nft-detail.spec.ts`, `account.spec.ts`); falta fallback de SPA no deploy |
| `README.md` completo                                                            | Verificado   | `README.md` (setup, env vars, credenciais, cenários, comandos e falhas) |
| `ARCHITECTURE.md` completo                                                      | Verificado   | `ARCHITECTURE.md` (REST, Socket.IO, sessão, carrinho, cache, MSW e UX)  |
| Scripts: dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse | Em andamento | `test:e2e` e `test:e2e:ui` disponíveis; falta `lighthouse`              |
| Execução a partir de checkout limpo                                             | Pendente     | Validar ao final                                                        |
