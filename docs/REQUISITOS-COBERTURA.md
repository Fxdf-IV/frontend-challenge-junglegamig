# Cobertura dos requisitos

Matriz item a item de `REQUISITOS.md`. Status: `Pendente`, `Em andamento`, `Implementado`,
`Verificado`. Só vira `Verificado` com teste automatizado ou medição citada na linha
(regras em `AGENTS.md`, seção 13).

Legenda de leitura: "Implementado" significa que o código existe, mas o requisito ainda não tem prova
automatizada suficiente para ser marcado como verificado. Os grupos Playwright 1 e 2 estão verificados;
o grupo 3 tem cobertura parcial e segue em andamento.

**Resumo atual:** Verificado 14 · Implementado 59 · Em andamento 8 · Pendente 28 (109 itens)

## 2. Stack obrigatória

| Item               | Status       | Onde / prova                                                |
| ------------------ | ------------ | ----------------------------------------------------------- |
| React + TypeScript | Implementado | `src/`, `bun run typecheck` limpo                           |
| TanStack Router    | Implementado | `src/routes`, guarda em `_authenticated.tsx`                |
| TanStack Query     | Implementado | `src/api/queries.ts`, hooks em `src/lib`                    |
| Axios              | Implementado | `src/api/client.ts`                                         |
| REST APIs          | Implementado | `src/api/endpoints.ts`, handlers em `src/mocks/handlers.ts` |
| Socket.IO          | Implementado | `src/lib/realtime.tsx`, `src/mocks/realtime.ts`             |
| Tailwind CSS       | Implementado | `src/styles.css`                                            |
| shadcn/ui          | Implementado | `src/components/ui` (adaptar aos tokens do Figma)           |
| MSW                | Implementado | `src/mocks`                                                 |
| Playwright         | Em andamento | Grupos 1–2 verificados; grupo 3 parcial; grupos 4–12 e regressão visual pendentes |
| Lighthouse         | Pendente     | Sem configuração nem relatórios                             |

## 3. Telas e fluxos

| Item                                                    | Status       | Onde / prova                                                      |
| ------------------------------------------------------- | ------------ | ----------------------------------------------------------------- |
| Início: destaques, catálogo, busca, filtros, ordenação  | Implementado | `routes/index.tsx`, `components/nft/Catalog.tsx`                  |
| Favoritos: navegação mobile, visitante, lista e vazio   | Verificado   | `tests/e2e/favorites.spec.ts` (desktop/mobile)                     |
| Detalhe: galeria, edição, quantidade, favoritos, compra | Implementado | `routes/nft.$id.tsx`                                              |
| Carrinho: quantidades, remoção, cupom, resumo           | Verificado   | `tests/e2e/cart.spec.ts` (desktop/mobile)                          |
| Pagamento: dados, carteira e rede, revisão, envio       | Implementado | `routes/_authenticated.checkout.tsx`                              |
| Confirmação de pedido                                   | Verificado   | `tests/e2e/checkout-success.spec.ts` (pedido confirmado e recibo após refresh) |
| Login com retorno ao fluxo anterior                     | Verificado   | `tests/e2e/account.spec.ts` (login privado e refresh, desktop/mobile) |
| Cadastro com conflito                                   | Verificado   | `tests/e2e/account.spec.ts` (conflito duplicado, desktop/mobile)   |
| Perfil: dados, avatar, senha                            | Implementado | `routes/_authenticated.perfil.tsx`                                |
| Carteiras principal e secundária                        | Implementado | `routes/_authenticated.carteiras.tsx`                             |
| Desktop e mobile fiéis ao Figma                         | Em andamento | `docs/FIGMA-DEVIATIONS.md`; falta acesso aos pins/frame por frame |
| Perfil, carteiras e confirmação em mobile               | Em andamento | Sem frame no Figma; revisar em 390 px                             |
| Ações fora do escopo não aparentam sucesso              | Em andamento | `components/ComingSoon.tsx`; revisar links do header e footer     |

## Catálogo e detalhe

| Item                                                      | Status       | Onde / prova                                |
| --------------------------------------------------------- | ------------ | ------------------------------------------- |
| Busca, filtros, ordenação e página na URL                 | Implementado | `lib/catalog-search.ts`                     |
| Filtros combináveis; filtro reinicia a página             | Implementado | `Catalog.tsx` (função `set`)                |
| Consultas refletem os params; vazio, falha, fora de ordem | Implementado | `api/queries.ts`, cenário `empty`, `jitter` |
| Detalhe: acesso direto, inexistente, esgotado, limite     | Implementado | `routes/nft.$id.tsx`                        |
| Favoritos persistem por usuário                           | Verificado   | `tests/e2e/favorites.spec.ts` (add, lista e refresh) |

## Carrinho

| Item                                                    | Status       | Onde / prova                           |
| ------------------------------------------------------- | ------------ | -------------------------------------- |
| Adicionar, alterar, remover respeitando disponibilidade | Implementado | `lib/cart.ts`, handlers `/cart`        |
| Carrinho persiste e itens do visitante migram no login  | Verificado   | `tests/e2e/cart.spec.ts` (migração no login) |
| Cupom: aplicar, remover, inválido, expirado             | Verificado   | `tests/e2e/cart.spec.ts` (válido, inválido, expirado) |
| Subtotal, desconto, taxa e total vindos da API          | Verificado   | `tests/e2e/cart.spec.ts` (subtotal e total via cotação) |
| Reflete preço e disponibilidade em tempo real           | Implementado | `lib/realtime.tsx` (`nft.updated`)     |
| ETH como string decimal; quantidades inteiras           | Implementado | `lib/eth.ts`, `eth.test.ts` (unitário) |

## Pagamento e confirmação

| Item                                                      | Status       | Onde / prova                               |
| --------------------------------------------------------- | ------------ | ------------------------------------------ |
| Validação dos campos e revisão antes do envio             | Implementado | `checkout.tsx`                             |
| Carteiras cadastradas, rede, conexão, recusa, desconexão  | Implementado | `checkout.tsx`                             |
| Revalidar preço, estoque, cupom e taxas; nova confirmação | Implementado | handler `/orders`, `quote.id`              |
| Sem pedidos duplicados (clique repetido, timeout)         | Implementado | `Idempotency-Key`, cenário `order-timeout` |
| Pendente, confirmado, recusado; recuperação após refresh  | Implementado | `resolveOrder`, `schedulePendingOrders`    |
| Confirmação só para pedido confirmado                     | Implementado | `pedido.$id.tsx`                           |
| Preserva itens em falha; remove só o comprado             | Implementado | `resolveOrder`                             |
| Recibo é snapshot do pedido                               | Implementado | `Order.lines` no pedido                    |

## Conta e sessão

| Item                                                 | Status       | Onde / prova                            |
| ---------------------------------------------------- | ------------ | --------------------------------------- |
| Cadastro, login, logout, sessão                      | Implementado | `lib/session.tsx`, handlers `/auth`     |
| Sessão recuperável após refresh; expiração tratada   | Implementado | `tokenStore`, cenário `session-expired` |
| Logout/troca de usuário limpam cache e subscriptions | Implementado | `clearPrivate`, `RealtimeProvider`      |
| Validação de formulários com erros da API            | Implementado | `components/Field.tsx`, `AuthForms.tsx` |
| Senhas não armazenadas em claro                      | Implementado | `sha256(salt + senha)` em `mocks/db.ts` |

## 4. Integração e estado

| Item                                                      | Status       | Onde / prova                                   |
| --------------------------------------------------------- | ------------ | ---------------------------------------------- |
| Contratos tipados                                         | Implementado | `api/types.ts`                                 |
| Estados de carregamento, vazio, erro, sucesso, background | Implementado | Catálogo, carrinho, detalhe                    |
| Invalidação após mutations e eventos                      | Implementado | `lib/cart.ts`, `lib/realtime.tsx`              |
| Descarte de respostas obsoletas                           | Implementado | Query keys com params; revisar uso de `signal` |
| Isolamento por usuário e por parâmetros                   | Implementado | Query keys `["u", userId, ...]`                |
| Rotas inexistentes e acesso direto                        | Implementado | `NotFoundComponent` em `__root.tsx`            |
| Atualização otimista com rollback                         | Verificado   | `tests/e2e/favorites.spec.ts` (falha 500 e nova tentativa) |
| Política de cache documentada                             | Pendente     | `ARCHITECTURE.md`                              |

## 5. Contratos REST

| Item                                                                    | Status       | Onde / prova                 |
| ----------------------------------------------------------------------- | ------------ | ---------------------------- |
| Sessão e conta; NFTs; favoritos; carrinho                               | Implementado | `api/endpoints.ts`, handlers |
| Cotação; pedidos idempotentes; perfil; carteiras                        | Implementado | `api/endpoints.ts`, handlers |
| Erros: validação, sessão, permissão, inexistente, conflito, transitório | Implementado | `ApiErrorBody`, função `err` |
| Contratos documentados                                                  | Pendente     | `ARCHITECTURE.md`            |

## 6. Mocking com MSW

| Item                                                                                | Status       | Onde / prova                                                          |
| ----------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| Mocks na camada de rede, sem respostas fictícias na UI                              | Implementado | `src/mocks`                                                           |
| Estado consistente e persistente; reset restaura cenário                            | Implementado | `mocks/db.ts`, `MockPanel.tsx`                                        |
| Lentidão, jitter, timeout, offline, 4xx/5xx                                         | Implementado | `withScenario` (`slow`, `jitter`, `flaky`, `offline`, `server-error`) |
| Fixtures variadas e dois usuários                                                   | Implementado | `mocks/fixtures.ts`; revisar variedade para paginação                 |
| Cenários: sucesso, vazio, expirada, cupom, preço, esgotado, timeout, pago, recusado | Implementado | `ScenarioId` em `api/types.ts`                                        |
| Socket.IO via `@mswjs/socket.io-binding`                                            | Implementado | `mocks/realtime.ts`                                                   |
| Mudanças refletem em REST e eventos                                                 | Implementado | `bumpNft`, `resolveOrder`                                             |
| Mock ativado por variável de ambiente e no build de demo                            | Em andamento | `VITE_ENABLE_MOCKS`; confirmar no build                               |
| Limitações do transporte documentadas                                               | Pendente     | `ARCHITECTURE.md`                                                     |

## 7. Tempo real

| Item                                                              | Status       | Onde / prova                      |
| ----------------------------------------------------------------- | ------------ | --------------------------------- |
| `nft.updated` e `order.updated`                                   | Implementado | `lib/realtime.tsx`                |
| Identidade estável, recurso e versão; tolera duplicatas e antigos | Implementado | `fresh()` em `realtime.tsx`       |
| Reconexão reconcilia com REST                                     | Implementado | `connect` com `invalidateQueries` |
| Eventos de outra sessão ignorados                                 | Implementado | Filtro por `userId`               |
| Listeners liberados no cleanup                                    | Implementado | `removeAllListeners`              |
| Cenário carrinho, mudança, aviso, checkout bloqueado              | Implementado | Cenário `price-change`            |
| Interrupção com pedido pendente sem nova compra                   | Implementado | Cenário `order-timeout`           |

## 8. Interface, responsividade e acessibilidade

| Item                                                  | Status       | Onde / prova                       |
| ----------------------------------------------------- | ------------ | ---------------------------------- |
| Fidelidade ao Figma                                   | Em andamento | `docs/FIGMA-DEVIATIONS.md`         |
| 390, 768 e 1440 px sem overflow                       | Pendente     | Medir e cobrir em teste            |
| Skeleton com shimmer e `prefers-reduced-motion`       | Implementado | `styles.css`, `NftCardSkeleton`    |
| Skeleton sem layout shift (catálogo, detalhe, resumo) | Pendente     | Conferir dimensões e medir CLS     |
| Teclado, foco visível, foco em dialogs e drawers      | Pendente     | Revisar e testar                   |
| Labels, `aria-invalid`, `aria-describedby`            | Implementado | `components/Field.tsx`             |
| `alt` em imagens relevantes                           | Implementado | Revisar todas as telas             |
| Feedback acessível de mutations e eventos             | Implementado | `aria-live` e `role="status"`      |
| Fontes e imagens locais                               | Pendente     | Hoje as fontes vêm do Google Fonts |
| Desvios de asset/a11y documentados                    | Pendente     | `docs/FIGMA-DEVIATIONS.md`         |

## 9. Testes com Playwright (12 grupos)

| Grupo                                                                   | Status   |
| ----------------------------------------------------------------------- | -------- |
| 1. Busca, filtros, ordenação, paginação, histórico                      | Verificado (`tests/e2e/catalog.spec.ts`; desktop/mobile, sort desktop) |
| 2. Detalhe direto e recurso inexistente                                 | Verificado (`tests/e2e/nft-detail.spec.ts`; ambos viewports) |
| 3. Cadastro, login, expiração, logout, troca de usuário                 | Em andamento (`tests/e2e/account.spec.ts`; 11 passaram, logout/troca desktop; 1 skip mobile) |
| 4. Favoritos com falha e recuperação                                    | Verificado (`tests/e2e/favorites.spec.ts`; 8/8, desktop/mobile) |
| 5. Carrinho, quantidades, remoção, cupom, persistência                  | Verificado (`tests/e2e/cart.spec.ts`; 6/6, desktop/mobile) |
| 6. Compra completa até o recibo                                         | Verificado (`tests/e2e/checkout-success.spec.ts`; 2/2, desktop/mobile) |
| 7. Falha de pagamento, clique repetido, timeout e idempotência          | Pendente |
| 8. Perfil, avatar, senha e carteiras com erros                          | Pendente |
| 9. Preço/disponibilidade via Socket.IO no checkout                      | Pendente |
| 10. Eventos duplicados/antigos, desconexão, retomada                    | Pendente |
| 11. Teclado, foco de dialogs, validação                                 | Pendente |
| 12. Skeletons, falha e recuperação                                      | Pendente |
| Chromium em desktop e mobile; regressão visual; relatório HTML e traces | Em andamento; smoke da home passou em 1440×1000 e 390×844, baselines visuais pendentes |

## 10. Performance e Lighthouse

| Item                                                                       | Status   |
| -------------------------------------------------------------------------- | -------- |
| Auditoria de início e detalhe, mobile e desktop, 3 medições, mediana       | Pendente |
| Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90 | Pendente |
| LCP, CLS e TBT registrados; relatórios HTML/JSON versionados               | Pendente |

## 12. Entrega

| Item                                                                            | Status       | Onde / prova                     |
| ------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| Código, lockfile, assets, mocks, fixtures                                       | Implementado | `bun.lock`, `src/mocks`          |
| Testes e configuração de auditoria                                              | Pendente     | Playwright e Lighthouse          |
| Deploy público com mocks e tempo real                                           | Pendente     | Depende da conta do usuário      |
| Acesso direto e refresh em qualquer rota                                        | Pendente     | Fallback de SPA no deploy        |
| `README.md` completo                                                            | Pendente     | Hoje só tem o básico             |
| `ARCHITECTURE.md` completo                                                      | Pendente     | Ainda não existe                 |
| Scripts: dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse | Em andamento | `test:e2e` e `test:e2e:ui` disponíveis; falta `lighthouse` |
| Execução a partir de checkout limpo                                             | Pendente     | Validar ao final                 |
