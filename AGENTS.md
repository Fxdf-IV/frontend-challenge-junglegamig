# AGENTS.md

Regras de trabalho para este repositório (Kurio — NFT Marketplace). Fonte de verdade dos
requisitos: `REQUISITOS.md` do desafio. Em caso de conflito entre estas regras e o enunciado,
vale o enunciado.

## 1. Prioridades

Ordem de decisão quando houver trade-off, alinhada aos pesos da avaliação:

1. Fidelidade visual e responsividade (20) e fluxos completos (20).
2. Integração e estado (15), tempo real (10), mocking (10), testes (10).
3. Acessibilidade, performance, arquitetura e documentação (5 cada).

Itens eliminatórios, nunca aceitar regressão: stack obrigatória sem uso efetivo, fluxo apenas
visual, compra confirmada sem resposta da simulação, dados vazando entre usuários, evento
simulado direto na UI, ausência de E2E executável.

## 2. Stack e responsabilidades

- React + TypeScript estrito. Sem `any` e sem `@ts-ignore`; justifique `eslint-disable` em comentário.
- Rotas, search params e guardas privadas: TanStack Router (`src/routes`). Não editar `routeTree.gen.ts`.
- Dados remotos: TanStack Query. Toda chamada HTTP passa pelo cliente Axios (`src/api/client.ts`).
- Tempo real: `socket.io-client` em `src/lib/realtime.tsx`. Nunca chamar setters ou escrever no cache
  como atalho para simular um evento.
- Estilo: Tailwind + componentes shadcn/ui adaptados aos tokens do Figma em `src/styles.css`.
- Mocks: somente em `src/mocks` (MSW REST + `@mswjs/socket.io-binding`). Componentes, hooks e Axios
  não contêm respostas fictícias nem caminhos alternativos de negócio.

Estrutura: `api/` contratos e endpoints, `lib/` regras puras e providers, `components/` UI,
`routes/` telas, `mocks/` rede simulada. Regra de negócio fica em `lib/` ou nos handlers, não em JSX.

## 3. Contratos e dinheiro

- Tipos de transporte vivem em `src/api/types.ts` e são reutilizados por handlers, queries e UI.
  Validar respostas e params externos com `zod` quando houver ambiguidade.
- ETH sempre como string decimal. Cálculos só com os helpers de `src/lib/eth.ts` (sem `Number` /
  ponto flutuante). Quantidades são inteiros. A cotação da API é a referência para fechar o pedido.
- Erros da API seguem um formato único (`code`, `message`, campos) cobrindo: validação, sessão inválida,
  permissão, inexistente, conflito de disponibilidade e falha transitória.
- Mutations de pedido enviam `Idempotency-Key`. Mesma chave com mesmo corpo devolve o mesmo pedido;
  corpo diferente gera conflito.

## 4. Estado, cache e tempo real

- Query keys incluem o usuário e todos os parâmetros que alteram a resposta.
- Busca, filtros, ordenação e página vivem na URL; mudar filtro zera a página.
- Descartar respostas obsoletas (`signal` do Query, `placeholderData` coerente). Nunca renderizar dado de
  outra combinação de parâmetros.
- Pelo menos uma atualização otimista com rollback (favoritos). Invalidar após mutations e eventos.
- Eventos `nft.updated` e `order.updated` carregam `id`, recurso e `version`. O cliente ignora duplicatas
  e versões antigas e reconcilia com REST após reconexão. Liberar listeners no cleanup.
- Logout e troca de usuário limpam cache privado, storage de sessão e subscriptions.
- Pedido: pendente, confirmado e recusado; confirmado e recusado são terminais. Recibo é snapshot e não
  muda com o catálogo. Antes de confirmar, revalidar preço, estoque, cupom e taxa; mudança exige nova
  confirmação. Bloquear duplo clique e reenvio.
- Documentar política de cache, retries e sincronização em `ARCHITECTURE.md` sempre que mudar.

## 5. Mocks e cenários

- Estado do mock é único e consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos.
- Cenários determinísticos e selecionáveis (`?scenario=` e painel de dev), com reset que restaura o
  cenário conhecido. Cobrir: sucesso, vazio, latência variável e fora de ordem, falha de conexão, 4xx/5xx,
  sessão expirada, conflito de cadastro, cupom inválido/expirado, preço alterado, edição esgotada, timeout
  após criar pedido, pagamento confirmado e recusado.
- Fixtures com variedade para filtros e paginação e ao menos dois usuários. Senhas nunca em claro:
  armazenar hash simulado.
- Mudanças nos dados do mock refletem em REST e em eventos Socket.IO.
- O mock é ativado por variável de ambiente e funciona no build de demonstração.

## 6. UI, responsividade e acessibilidade

- Medir em 390, 768 e 1440 px. Sem overflow horizontal e sem perda de conteúdo com zoom.
- Skeleton com shimmer em catálogo, detalhe e resumo do carrinho, com as mesmas dimensões do conteúdo
  (sem layout shift) e respeitando `prefers-reduced-motion`.
- Teclado e foco visível em tudo. Dialogs e drawers prendem e devolvem o foco.
- Formulários: `label`, `aria-invalid`, `aria-describedby` com a mensagem de erro; erro retornado pela API
  também associado ao campo.
- Mutations e eventos em tempo real anunciados com `role="status"` / `aria-live`. Estado nunca só por cor.
- Imagens relevantes com `alt`; decorativas com `alt=""`. Imagens com `width`/`height`; a primeira do LCP
  com `fetchPriority="high"`, as demais `loading="lazy"`. Fontes e assets servidos localmente.
- Ações fora do escopo (editorial, suporte, atividade, ofertas, downloads) não aparentam sucesso:
  rotulá-las como indisponíveis.

## 7. Fidelidade ao Figma e registro de desvios

O Figma define identidade visual e composição. Estados não desenhados seguem o mesmo padrão visual.

**Obrigatório:** manter `docs/FIGMA-DEVIATIONS.md` com tudo que estava errado, impreciso ou ambíguo no
Figma e como foi corrigido neste projeto. Cada correção feita por causa do design entra no mesmo
commit que a alterou. Formato de cada entrada:

| Campo | Conteúdo |
| --- | --- |
| ID | `FD-NN` sequencial (e nº do comentário do Figma, se houver) |
| Tela / frame | Onde ocorre (desktop, mobile ou ambos) |
| Problema | O que estava errado ou impreciso no Figma (medida, copy, estado ausente, inconsistência) |
| Correção | O que foi implementado e onde (arquivo ou componente) |
| Motivo | Acessibilidade, responsividade, consistência, requisito do enunciado etc. |

Incluir também: substituições de assets, ajustes de acessibilidade, estados criados sem frame
(erro, vazio, carregamento, mobile de perfil/carteiras/confirmação) e qualquer valor que divergiu do
design. Resumir os pontos de maior impacto em `ARCHITECTURE.md` (seção "Desvios do Figma").

## 8. Testes

- Playwright, Chromium, viewports desktop (1440) e mobile (390), cada teste com estado isolado
  (reset do cenário, relógio e latência controlados).
- Cobrir os 12 grupos do enunciado (seção 9): catálogo e histórico, detalhe/404, conta e sessão, favoritos
  com falha, carrinho, compra completa, falhas de pagamento/idempotência, perfil e carteiras, Socket.IO no
  checkout, eventos duplicados/antigos e reconexão, teclado/foco, skeletons e recuperação.
- Asserções observam a interface e o resultado das operações. Tempo real passa pelo `socket.io-client`;
  REST passa pelos handlers MSW.
- Regressão visual (início, detalhe, carrinho, pagamento) com baselines versionadas e dados estáveis.
- Relatório HTML e traces em falha. Testes unitários (Vitest) para regras puras (`eth`, cupom, versão de evento).
- Nova regra de negócio sem teste não é aceita.

## 9. Performance (Lighthouse)

- Auditar início e detalhe em mobile e desktop, build otimizado, 3 medições, mediana por categoria.
  Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Registrar LCP, CLS e TBT, versões, ambiente e justificar o que ficar abaixo da meta.
- Sem simplificar a página só para pontuar. Evitar bloqueio de render por fontes, imagens sem dimensão e
  JS desnecessário na rota inicial (divisão de código por rota).
- Config e relatórios (HTML/JSON) versionados.

## 10. Fluxo de trabalho e commits

- Um assunto por commit, pequeno e coeso, que compile e passe nos testes. Mensagens em inglês no formato
  `tipo: resumo no imperativo` (`feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`).
- Intervalos reais entre commits; não alterar datas nem reescrever histórico já publicado.
- Antes de cada commit: `bun run typecheck`, `bun run lint`, `bun run test`. Antes de entrega: `bun run build`
  e a suíte E2E.
- Não versionar segredos, `.env` local, `dist`, relatórios temporários nem `node_modules`.
- Não incluir referências a ferramentas de geração de código ou a plataformas externas em código,
  comentários, docs, metadados de pacote ou mensagens de commit.
- Preservar comentários e docstrings existentes que não tenham relação com a alteração.

## 11. Documentação e entrega

- `README.md`: setup, variáveis de ambiente, credenciais fictícias, seleção e reset de cenários, comandos
  (dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse) e como reproduzir cada falha.
- `ARCHITECTURE.md`: contratos REST e eventos, política de sessão, estado do carrinho, cache, reconciliação
  REST x Socket.IO, transporte e limitações do Socket.IO sob MSW, decisões de UX, desvios do Figma.
- `docs/FIGMA-DEVIATIONS.md`: ver seção 7.
- Deploy público obrigatório (Vercel, Netlify ou Cloudflare Pages) com mocks e tempo real ativos, acesso
  direto e refresh funcionando em qualquer rota (fallback de SPA/SSR configurado).
- A entrega roda a partir de um checkout limpo, sem serviços privados.
