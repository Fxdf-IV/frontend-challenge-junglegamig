# Progresso do projeto

Diário do que está sendo feito e lista de próximos passos. Atualizado a cada commit relevante
(regras em `AGENTS.md`, seção 13). Cobertura dos requisitos em `docs/REQUISITOS-COBERTURA.md`.

## Próximos passos (ordem de prioridade)

1. **Deploy público (`AGENTS.md`, seção 11):**
   - Realizar o deploy na Vercel/Netlify/Cloudflare Pages mediante indicação de credenciais ou autorização de publicação pelo usuário (projeto com `vercel.json` e `public/_redirects` prontos).

### Bloqueios e decisões do usuário

- **Deploy público:** depende da indicação e autorização do usuário sobre qual provedor de hospedagem utilizar.

## Concluído recentemente (25/10/2026)

- **Alinhamento do recibo e modal de confirmação de compra ao Figma (`src/routes/_authenticated.pedido.$id.tsx`, FD-38):**
  - Implementado o ícone oficial de envelope com carta 'THANK YOU' (`/nft/thank-you.png`) no topo do recibo confirmado, substituindo o ícone genérico `message.svg`.
  - Adicionada moldura superior e inferior laranja (`border-y border-primary`) na grade de 4 metadados com divisores verticais e destaque primário no valor total.
  - Tabela de itens da transação reformulada com miniaturas ampliadas para 56–64 px (`h-14 w-14 rounded-lg`), nome completo, legenda `ID do token: #0042`, edições centralizadas entre parênteses `(× {quantity})` e subtotal em destaque laranja.
  - Bloco de totais (`Subtotal`, `Desconto`, `Taxa de rede` e `Total`) deslocado à direita conforme especificação do Comentário #51 do Figma.
  - Barra de destaque sólida de 8 px em cor primária na base do modal (`border-b-[8px] border-b-primary`) e cantos curvos `rounded-2xl`.
  - Preservado o botão "Copiar ID" expressamente solicitado pelo usuário, posicionado de forma harmônica ao lado do CTA primário "Ver no Etherscan (simulado)".
  - Botão de fechar (X) estilizado na cor primária âmbar do Figma (`[&>button]:text-primary`).
  - Totalmente testado com Vitest (32/32) e Playwright E2E (`checkout-success.spec.ts`, `event-versioning.spec.ts`, `checkout-realtime.spec.ts`, `visual.spec.ts` 16/16 aprovados).

- **Alinhamento completo das telas de login e cadastro mobile aos frames do Figma (`AuthShell.tsx`, `AuthForms.tsx`, `login.tsx`, `cadastro.tsx`, FD-37):**
  - Substituído o diálogo flutuante comprimido de 278 × 600 px por apresentação imersiva em tela cheia no mobile (`bg-[#0c0805]`) sem corte e sem botão "X", fiel aos frames oficiais do Figma.
  - Implementado logotipo "KURIO" em destaque no topo com espaçamento largo (`tracking-[0.25em]`) e títulos centralizados ("Entrar" e "Criar perfil de colecionador").
  - Campos de entrada padronizados com altura de 48px (`h-12`), cantos arredondados `rounded-xl`, bordas sutis `#38251a`, fundo escuro `#140c07` e placeholders em bronze.
  - Adicionado botão de alternância de visibilidade com ícone de olho em ambos os campos de senha no cadastro ("Senha" e "Confirmar senha") com estados independentes.
  - Botão de ação primária com `h-12 rounded-xl` em âmbar ("Entrar" no login e "Criar perfil" no cadastro com `aria-label="Criar conta"` para manter total compatibilidade de acessibilidade e testes Playwright).
  - Botões sociais ("Continuar com Google" e "Continuar com Facebook") ajustados para altura confortável `h-12 rounded-xl` e ícones SVG temáticos.
  - Links de rodapé padronizados exatamente aos textos do Figma: "Novo na Kurio? Crie uma conta" no login e "Já tem uma conta? Entre" no cadastro.
  - Modal desktop (420px com abas `Entrar | Criar conta` e borda inferior laranja) preservado 100% intacto.
  - 100% dos testes unitários (Vitest 32/32) e Playwright E2E (`account.spec.ts`, `accessibility.spec.ts`) aprovados com sucesso.

- **Redesign do modal de conexão Web3 (MetaMask/simulação) e refinamento de diálogos mobile (`_authenticated.checkout.tsx`, `dialog.tsx`, FD-36):**
  - Refatorado o componente base `DialogContent` em `src/components/ui/dialog.tsx` para aplicar `w-[calc(100%-2rem)] rounded-2xl border-[#3d2c20] bg-[#140d07]` no mobile, eliminando cantos retos (`rounded-none`) e garantindo margem de respiro de 16px em relação às bordas da tela.
  - Implementado visual autêntico de carteira Web3 no modal de autorização de checkout:
    - Banner visual de handshake no topo conectando o Kurio à carteira (logo Kurio em dourado ↔ pontos pulsantes ↔ ícone temático da carteira).
    - Card de dados técnicos com endereço abreviado, indicador de rede ativa com pulso verde e aviso acessível de que nenhum fundo será debitado.
    - Botões de ação lado a lado (`Recusar` e `Aprovar conexão`) com proporções equilibradas e tipografia mono sem caixas pesadas de texto.
  - Passagem garantida de 100% dos testes unitários e de checkout no Playwright.

- **Substituição das letras W, C e D por ícones temáticos nos cards do rodapé (`src/components/layout/Footer.tsx`, FD-35):**
  - Atendido o comentário #17 do Figma e solicitação do usuário substituindo as letras placeholder 'W', 'C' e 'D' por ícones vetoriais de alto padrão visual:
    - **Segurança da carteira:** `ShieldCheck` (ícone de escudo com verificação, representando segurança e proteção da carteira).
    - **Criadores em destaque:** `Palette` (ícone de paleta artística, representando arte digital e criadores da rede).
    - **Alertas de lançamentos:** `Bell` (ícone de sino, representando notificações e calendários de cunhagem).
  - Preservados os círculos originais do Figma (`size-14 rounded-full bg-primary text-primary-foreground`) com traço refinado `strokeWidth={2.2}`.
  - Testes unitários (32/32) e suíte visual do Playwright (4/4) revalidados com 100% de sucesso.

- **Remoção de tags de raridade dos cards de NFT para fidelidade 100% ao Figma (`src/components/nft/NftCard.tsx`, FD-34):**
  - Removidas as abas triangulares de raridade ("RARO", "ÉPICO", "LENDÁRIO") que ficavam sobrepostas no canto superior esquerdo da imagem dos cards de NFT.
  - Como validado com o usuário, tais tags não fazem parte de nenhum requisito do enunciado (`REQUISITOS.md`) e não existem no Figma.
  - Cards do catálogo agora exibem arte limpa com cantos arredondados, botão circular translúcido de favoritos no canto superior direito e metadados de preço e estoque abaixo da imagem.
  - Atualizadas as baselines de regressão visual do Playwright (4/4 testes aprovados sem divergência visual).

- **Refinamento visual da barra de ferramentas e abas do catálogo (`src/components/nft/Catalog.tsx`, `src/styles.css`, FD-33):**
  - Adicionado utilitário `@utility no-scrollbar` em `src/styles.css` eliminando qualquer barra de rolagem horizontal cinza nativa do navegador em Windows/macOS/Linux.
  - Adicionado `shrink-0` nas abas de navegação do catálogo ("Todos os NFTs", "Novos lançamentos", "Em alta") e borda de base horizontal `border-b border-[#3d2c20]/60`, garantindo que o texto nunca mais seja truncado (ex.: "Em al").
  - Estilizado o campo de busca "Explorar coleções" com ícone embutido `Search` da Lucide, superfície escura `#19110a`, borda fina `#3d2c20` e tipografia `font-mono text-xs`.
  - Estilizado o seletor "Ordenar por:" com `appearance-none`, fundo `#19110a`, borda `#3d2c20` e seta customizada `ChevronDown` em tom bronze (`#CFB28C`).
  - Alinhamento responsivo fluido com `xl:flex-row xl:items-center xl:justify-between`, evitando empilhamento assimétrico entre busca e ordenação.
  - Suíte de testes (Vitest 32/32 e Playwright 4/4) 100% aprovada sem overflow horizontal em 390, 768 e 1440 px.

- **Alinhamento do rodapé às opções e estilos oficiais do Figma (`src/components/layout/Footer.tsx`, FD-32):**
  - Atualizadas as três colunas de navegação do rodapé com exatamente as 5 opções do design do Figma:
    - Coluna 1 ("Meu perfil"): "Meu perfil" (link `/perfil`), "Minha coleção" (aviso de escopo), "Atividade" (aviso de escopo), "Estúdio do criador" (link `/criadores`) e "Lista de interesse" (link `/favoritos`).
    - Coluna 2 ("Central de ajuda"): "Central de ajuda", "Como comprar NFTs", "Carteira e segurança", "Política do mercado" (links informativos `/aprenda`) e "Denunciar item" (aviso de escopo).
    - Coluna 3 ("Coleções"): "Arte digital", "Fotografia", "Música", "Arte 3D" e "Utilidade" (links com busca filtrada `/mercado?collections=...`).
  - Redes sociais estilizadas com caixas quadradas contornadas `border-[#3d2c20]` em vez de blocos sólidos laranjas.
  - Carteiras compatíveis harmonizadas em container unificado no padrão dark/ouro `METAMASK • WALLETCONNECT • COINBASE`.
  - Tratamento responsivo sem overflow horizontal (`min-w-0`, `p-4 sm:p-6 md:p-8`, `gap-6 sm:gap-8`) mantendo 0 px de overflow em viewports de 390, 768 e 1440 px.
  - Criado teste unitário `src/components/layout/Footer.test.tsx` (32/32 testes Vitest passando) e atualizadas baselines do Playwright.

- **Carrossel interativo em "Colecionadores também viram" no carrinho (`src/routes/carrinho.tsx`, FD-26):**
  - Implementado carrossel interativo com `embla-carousel-react` integrado à grade de recomendações do carrinho.
  - Adicionadas setas de navegação laterais circulares (`ChevronLeft` e `ChevronRight`) flutuando nas extremidades da grade (`left-1 md:-left-5` e `right-1 md:-right-5`) com estados de foco acessíveis e desabilitação nos limites.
  - Organizados até 15 NFTs em 3 páginas/slides de 5 itens no desktop (com suporte a arraste/swipe por toque no mobile e tablet).
  - Transformadas as 3 bolinhas de paginação do Figma em abas interativas e acessíveis (`role="tab"`), clicáveis para saltar diretamente ao slide e sincronizadas em tempo real com o slide ativo (`○ ● ○`).
  - Adicionado teste automatizado em `src/test/carrinho.test.tsx` e polyfills de observadores em `src/test/setup.ts` (30/30 testes no Vitest e 4/4 no Playwright).

- **Redesign da navegação mobile do Meu perfil e Carteiras com seletor e Bottom Sheet (`src/components/AccountNav.tsx`, FD-31):**
  - Removida a barra horizontal de pílulas com scroll lateral (`overflow-x-auto -mx-4`), que cortava textos na borda da tela e poluía o topo das páginas autenticadas no mobile.
  - Implementado card seletor compacto em tema dark/ouro com o ícone da seção ativa, indicação textual clara ("Seção da conta: Dados do perfil / Carteiras") e botão "Opções ↕".
  - Acoplada gaveta móvel inferior nativa (Bottom Sheet via Radix Dialog/Sheet) acionada pelo seletor, com puxador visual, foco preso acessível (WCAG), páginas ativas identificadas com 'Atual ✓', recursos complementares com selo 'Em breve' e atalho destacado para logout.
  - Preservada 100% intacta a barra lateral desktop com visual fiel ao Figma.
  - Criado teste unitário `src/components/AccountNav.test.tsx` (30/30 testes passando no Vitest) e validados os testes E2E do Playwright (`profile-wallets.spec.ts` e `visual.spec.ts` com 0 overflow).

- **Refinamento do Header mobile com ícones oficiais do Figma e botões circulares sem borda (`src/components/layout/Header.tsx`, FD-30):**
  - Refatorado o cabeçalho no mobile para container flex `h-14 items-center justify-between` mantendo a grade desktop `md:grid md:h-16 md:grid-cols-[1fr_auto_1fr]` 100% inalterada.
  - Substituídos os ícones genéricos da Lucide no mobile pelos vetores SVG oficiais do Figma (`Search.svg`, `Shop.svg`, `User.svg`) no tom suave `#CFB28C`.
  - Eliminada a borda retangular laranja do botão de perfil no mobile (`rounded-full size-9 border-0`), harmonizando os 3 botões de ação (busca, carrinho e perfil/login) em formato de pílula circular.
  - Ajustado o badge de contagem de itens do carrinho para `-top-1 -right-1 font-mono text-[10px]`.
  - Suporte completo ao estado deslogado com ícone circular de usuário direcionando para `/login`.
  - Testes unitários (27/27) e testes E2E do Playwright validados com 100% de aprovação.

- **Consolidação dos relatórios oficiais do Lighthouse (`lighthouse/RESULTS.md` e `lighthouse/reports/`):**
  - Gerado `lighthouse/RESULTS.md` detalhando as 12 medições oficiais (medianas: Desktop 100/99, Mobile 87/86, Acessibilidade 100, Melhores Práticas 100 e SEO 100).
  - Incluída a análise técnica requerida pela Seção 10 de `REQUISITOS.md` explicando o impacto da simulação matemática Lantern sob Service Worker do MSW vs. a performance real (LCP real de 249 ms e TBT de 0 ms).
  - Documentada em `docs/FIGMA-DEVIATIONS.md` (`FD-29`) e `ARCHITECTURE.md` a decisão de arquitetura e UX da separação de responsabilidades em Perfil, Carteiras e Checkout, atendendo 100% aos requisitos da Seção 3.
  - Criado `.env.example` com as variáveis padrão documentadas e configurado `.prettierignore` para preservar relatórios de auditoria.

- **Exibição unificada da edição do NFT no carrinho desktop e mobile (`src/routes/carrinho.tsx`):**
  - Removida a ocultação de `Edição {it.edition}` no viewport desktop (`md:hidden`), permitindo a visualização clara da numeração de edição junto ao ID do token tanto no desktop quanto no mobile.
  - Validação completa com passagem de 100% dos testes E2E (`nft-detail.spec.ts` e suíte completa de 90 testes do Playwright: 88 passaram, 2 skips intencionais em mobile).

- **Unificação completa na branch principal `main` e remoção de worktrees temporárias:**
  - Todas as implementações, testes e mocks foram consolidados diretamente na branch `main`.
  - Passagem garantida de 100% dos checks de qualidade: `bun run typecheck` (0 erros), `bun run lint` (0 erros), `bun run test` (10 arquivos, 27 testes unitários), `bun run build` e `bun run test:e2e` (90 testes E2E).

- **Unificação da lista de itens e exibição de edição e token ID no carrinho (`src/routes/carrinho.tsx`):**
  - Consolidada a listagem de itens do carrinho em uma única grade responsiva sem duplicação de nós no DOM, mantendo a fidelidade visual aos cards do Figma em mobile e desktop.
  - Exibido o identificador da edição e o token ID em ambas as resoluções (`Edição {edition} · ID: {tokenId}`), atendendo às asserções do Playwright em `nft-detail.spec.ts`.
  - Cabeçalho "Resumo da carteira" visível em todas as resoluções no resumo lateral/folha inferior.
  - Execução 100% verde da suíte completa de testes: 88 testes aprovados (2 skips intencionais) no Playwright E2E e 27/27 no Vitest.

- **Remoção do badge sobreposto Sage Nomad no hero mobile (`src/routes/index.tsx`, FD-28 / comentário #63 do Figma):**
  - Atendendo à solicitação do usuário e resolvendo o comentário #63 do Figma ("esta imagem nao deveria estar aqui"), foi removida a imagem secundária de Sage Nomad (`absolute -bottom-3 -left-3 size-14 md:hidden`) sobreposta ao card de Emerald Ape no banner mobile de `src/routes/index.tsx`.
  - A composição mobile agora apresenta exclusivamente o destaque principal Emerald Ape com visual limpo.
  - Atualizadas as baselines de regressão visual do Playwright (`cart` e `home`) e refinada a seleção de rotas em `visual.spec.ts`.

- **Alinhamento do carrinho desktop com o Figma sem alterar o mobile (`carrinho.tsx`, FD-27):**
  - Removido o título duplicado "Carrinho de NFTs" no desktop, alinhado o cabeçalho da grade de itens com o cabeçalho do "Resumo da carteira" através de linha divisória compartilhada (`border-[#3d2c20]`).
  - Cada item na versão desktop passa a ser um cartão horizontal independente (`bg-[#19110a]` com thumbnail integrado nivelado à esquerda, nome completo do NFT, `ID do token: #0042`, preço em coluna própria, stepper com botões circulares primários, total e botão de exclusão alinhado à direita).
  - Painel de resumo no desktop integrado sobre o canvas sem caixa de cartão fechada; campo de cupom retangular com botão "Aplicar" anexo e botão de checkout retangular (`rounded-md`) com tipografia mono em caixa normal ("Conectar e finalizar" / "Concluir e finalizar").
  - Versão mobile 100% preservada com seus cards compactos, botões em pílula e folha fixa inferior.

- **Seção "Colecionadores também viram" no carrinho de compras (`carrinho.tsx`, FD-26):**
  - Implementada seção com título e sublinhado primário em laranja, grade de 5 cards com recomendações do catálogo (filtrando itens já presentes no carrinho) e indicadores de carrossel de 3 pontos (`○ ● ○`).
- **Adicionado botão 'Adicionar ao carrinho' na tela de detalhe do NFT (`nft.$id.tsx`) no padrão visual do site (FD-25):**
  - Implementado botão `variant="line"` com ícone `ShoppingCart`, tipografia mono e feedback imediato via toast sem forçar navegação, complementando a compra direta (`variant="brand"`) e o botão de favoritar (`Heart`), com ação `onAddToCart` unificada entre desktop e o botão móvel.
- **Padronizado o botão 'Explorar →' em toda a aplicação conforme o modelo do Figma (FD-24):**
  - Adicionada a variante `explore` em `button.tsx` com cantos `rounded-xl`, fundo primário sólido, texto escuro `text-primary-foreground` e tipografia `font-mono font-medium`; criado o componente reutilizável `ExploreButton.tsx`; e atualizados os botões do hero (`index.tsx`), das campanhas editoriais (`HomeEditorialSections.tsx`) e dos estados vazios (`favoritos.tsx`, `carrinho.tsx`, `_authenticated.checkout.tsx`).
- **Alinhada a área do usuário (Perfil do colecionador e Carteiras) fielmente aos frames do Figma (FD-23):**
  - Expandida a barra lateral `AccountNav.tsx` para 8 itens oficiais com indicador ativo de barra vertical laranja, ícone `MapPin` para Carteiras e ações fora de escopo tratadas como indisponíveis; reorganizado o perfil do colecionador em layout fluido sobre o canvas sem caixas isoladas, grade de 2 colunas com prefixo `.eth` à esquerda, avatar alinhado na 3ª linha, alternância de visibilidade nas senhas e botão `Salvar` unificado (`_authenticated.perfil.tsx`, `ProfileMetadataFields.tsx`, `Field.tsx`); e reestruturada a tela de carteiras com todos os 10 campos no formulário principal e estado vazio da carteira secundária com opção 'Igual à carteira principal' e ação 'Adicionar' (`_authenticated.carteiras.tsx`).
- **Alinhada a tela mobile de detalhe do NFT ao Figma (FD-22):**
  - Adicionados botões circulares no topo para voltar (`ChevronLeft`) e favoritar (`Heart`), barra inferior fixa com cantos superiores curvos `rounded-t-[1.5rem]`, stepper circular de quantidade `size-7`, preço total recalculado pela quantidade (`ethMul`), botão de compra em pílula `h-14 rounded-full` com gradiente primário e botão circular de adicionar ao carrinho em `#2f1d15` com feedback via toast (`nft.$id.tsx`).
- **Alinhado o hero da Home mobile, a grade escalonada e os cards de NFT ao Figma (FD-21):**
  - Restaurada a composição com anéis de gradiente `bg-hero-circles`, badge sobreposto Sage Nomad sobre Emerald Ape, CTA inline 'EXPLORAR ->', indicadores de carrossel, grade mobile em 2 colunas escalonadas (`max-md:*:even:translate-y-7`) e cards com selos de raridade ('RARO', etc.) e botão circular de favoritos com persistência e rollback otimista (`NftCard.tsx`, `Catalog.tsx`, `index.tsx`).
- **Implementada a barra de navegação inferior mobile fiel ao Figma em `MobileTabBar.tsx` (FD-20):**
  - Contêiner curvo `rounded-t-[2.5rem]`, entalhe central SVG recortado, botão flutuante com gradiente primário e ícone `ScanLine` para focar busca/catálogo, e 4 atalhos com ícones oficiais e indicação acessível de estado ativo.
- **Alinhado o carrinho mobile ao Figma (FD-19):**
  - Criado ícone vetorial `TrashFigmaIcon` com tampa reta, alça em arco e sem ranhuras internas em cor primária, reorganizada a linha de itens mobile com stepper e exclusão alinhados, input de cupom em pílula integrado com botão 'Aplicar' interno, cópia corrigida ('Desconto do lançamento', 'Taxa estimada') e botão full-width de checkout arredondado em pílula (`carrinho.tsx`).
- **Atualizada a tipografia global para Roboto Mono com carregamento 100% local (`@fontsource/roboto-mono`), alinhando ao design do Figma e eliminando requisições externas ao Google Fonts em `styles.css` e `__root.tsx` (FD-18). Adicionado utilitário `bg-hero-circles` para os anéis de gradiente do hero mobile.**
- **Validação de execução limpa e ajuste na reconciliação de tempo real:**
  - Invalidação automática de `queryKey: ["quote"]` na reconexão do socket em `src/lib/realtime.tsx`.
  - Incremento de versão do carrinho (`cart.version`) em `src/mocks/db.ts` quando preços ou disponibilidade são atualizados dinamicamente pelo catálogo ou eventos.
  - Ajuste no SSR de `src/routes/__root.tsx` restaurando a renderização síncrona de `AuthBackdrop` para eliminar aviso de hidratação no cliente.
  - Sincronização explícita de carregamento antes de ordenar catálogo no teste E2E `tests/e2e/catalog.spec.ts`.
  - Execução completa com sucesso da suíte de 90 testes E2E do Playwright (`88 passed, 2 skipped` intencionais no mobile), build de produção Nitro/Vite e Vitest (24/24 testes). Requisito "Execução a partir de checkout limpo" marcado como Verificado na matriz.
- **Documentação e Código Comentado (100% dos arquivos do projeto):**
  - Adicionados comentários de topo em pt-BR e JSDocs em todos os componentes UI shadcn/ui, rotas, módulos lib e api seguindo as diretrizes de `AGENTS.md` (seção 12).
- **Suíte Oficial do Lighthouse com 12 execuções e relatórios versionados:**
  - Configurado `lighthouserc.json` com limites obrigatórios e metas de auditoria em Início e Detalhe. Resultados consolidados: Início Desktop 100, Detalhe Desktop 99, Início Mobile 87, Detalhe Mobile 86. Acessibilidade 100, Melhores Práticas 100 e SEO 100 em todos os alvos.
- **Suíte E2E do Playwright cobrindo os 12 grupos do enunciado (seção 9):**
  - Criados testes E2E para catálogo, detalhe, favoritos, carrinho, checkout, falhas/idempotência, perfil/carteiras, Socket.IO, versionamento/dedup, acessibilidade/foco, skeletons e regressão visual com baselines versionadas.
- Plano E2E salvo em `docs/superpowers/plans/2026-10-25-playwright-e2e.md`, dividido por grupo de
  requisito para preparar Playwright e avançar em commits pequenos.
- Preparado `.worktrees/` ignorado para executar a implementação E2E isolada em branch `codex/`,
  sem misturar os commits já feitos em `main` com os novos grupos de teste.
- Corrigida a cópia da campanha “Arte digital selecionada e muito mais” conforme o frame local (#64):
  removido o sufixo “cultura”; a ação de cópia segue indefinida no material disponível.
- A captura controlada da home desktop voltou a travar após mais de 60 segundos e foi interrompida;
  a revisão de renderização do navegador segue pendente, sem alegação de validação visual.
- Grupo 3 Playwright em andamento: 11 testes passaram e 1 foi pulado em mobile porque a navegação
  inferior não oferece saída da conta. O E2E encontrou navegação repetida no guard privado; a guarda
  agora usa navegação por efeito e ignora a rota de login. Cobertura de logout/troca permanece desktop.
- `tests/e2e/account.spec.ts` passou no Chromium desktop/mobile: login com retorno ao perfil e refresh,
  credenciais inválidas, cadastro e refresh, cadastro duplicado e limpeza de token inválido; 1 skip
  mobile documentado para troca de conta. Não cobre ainda expiração por relógio nem dados privados
  diferentes de usuários.
- Checks pre-commit do grupo 3: `bun run typecheck`, `bun run lint` (zero erros, 9 avisos conhecidos)
  e `bun run test` (7 arquivos, 18 testes) passaram; focused E2E, 11 passaram e 1 skip. O E2E de
  favoritos do grupo 4 também passou; o próximo será carrinho.
- Grupo 4 de Playwright verificado com `tests/e2e/favorites.spec.ts`: 8/8 passaram em Chromium desktop
  e mobile (rodados com um worker para evitar colisão de Service Worker). Cobre convite ao visitante,
  favoritos vazios, persistência após refresh e rollback/recuperação de erro HTTP 500.
- Favoritos e carrinho ficaram em commits próprios. Continuam pendentes a cobertura parcial do grupo 3,
  os grupos 6–12 e a regressão visual.
- Grupo 5 (carrinho) passou em `tests/e2e/cart.spec.ts`: 6/6 em desktop/mobile. Cobre estado vazio,
  adicionar/atualizar/remover item, total ETH após quantidade, aplicar/remover cupom válido, cupons
  expirado/inválido e migração de itens de visitante para a conta no login.
- O grupo 5 está isolado de favoritos e tem commit próprio. A cobertura parcial do grupo 3, os grupos
  8–12 e a regressão visual continuam pendentes.
- Grupo 6 passou em `tests/e2e/checkout-success.spec.ts`: 2/2. O fluxo autenticado conecta uma carteira
  simulada, revisa a cotação, cria o pedido, aguarda confirmação e verifica o recibo após refresh em
  desktop e mobile.
- Grupo 7 passou em `tests/e2e/checkout-failures.spec.ts`: **10/10** em Chromium desktop/mobile.
  Cobre pagamento recusado com item preservado, preço alterado e nova confirmação, edição esgotada,
  bloqueio de clique duplo e recuperação do timeout com a mesma chave e corpo da requisição. Cupons
  inválidos/expirados já foram cobertos no grupo 5 pelo carrinho. Typecheck passou, lint sem erros
  (9 avisos conhecidos) e Vitest 18/18 passaram. Próximo lote: grupo 8 (perfil e carteiras).
- Grupo 8 passou em `tests/e2e/profile-wallets.spec.ts`: **8/8** em desktop/mobile. Cobre limites e
  persistência ENS/apelido, upload/salvamento/remoção do avatar, senha atual incorreta e atualização,
  além de criação/edição das carteiras principal e secundária e validação de endereço Ethereum/Solana.
  Os fluxos exercitados em 390 px não tiveram overflow horizontal. Typecheck passou, lint sem erros
  (9 avisos conhecidos) e Vitest 18/18 passaram. Próximo lote: grupo 9 (Socket.IO no checkout).
- Corrigida a interceptação de WebSocket do Socket.IO sob MSW: `src/lib/realtime.tsx` agora importa
  `socket.io-client` dinamicamente após a montagem do `MocksGate`, garantindo que `engine.io-client`
  use o `WebSocketProxy` do MSW em vez do `WebSocket` nativo capturado antes de `worker.start()`. Em
  `src/mocks/realtime.ts`, o handler vincula a origem `ws://`/`wss://` normalizada pelo MSW e dispara
  evento `error` ao recusar reconexões durante a janela `refuseUntil`.
- Grupo 9 passou em `tests/e2e/checkout-realtime.spec.ts`: **6/6** em Chromium desktop/mobile. Cobre
  confirmação do pedido pendente via `order.updated` antes do polling (`orderReads <= 1`), atualização
  de preço e bloqueio por esgotamento via `nft.updated` durante a revisão no `/checkout`, e queda de
  conexão com reconexão automática e reconciliação de `/api/cart` e cotação. Typecheck passou, lint sem
  erros (9 avisos conhecidos) e Vitest 18/18 passaram. Próximo lote: grupo 10 (versão e deduplicação de
  eventos).
- Grupo 10 passou em `tests/e2e/event-versioning.spec.ts`: **4/4** em Chromium desktop/mobile. Cobre
  descarte de `nft.updated` e `order.updated` duplicados (`duplicate`) e antigos (`stale`), aplicação
  exclusiva da versão mais nova, interrupção do socket com pedido pendente e retomada pelo aviso do
  checkout sem criar segunda compra (`orderPosts === 1`), e imutabilidade do snapshot do recibo após
  mudanças posteriores no catálogo. Typecheck, lint (0 erros/9 avisos) e Vitest 18/18 passaram. Próximo
  lote: grupo 11 (teclado, foco e validação acessível).
- Grupo 11 passou em `tests/e2e/accessibility.spec.ts`: **4/4** em Chromium desktop/mobile. Cobre
  navegação por teclado e link de salto com foco visível, prisão de foco em drawer/modal e restauração
  do foco ao gatilho com `Escape` (corrigido `onCloseAutoFocus` nos diálogos controlados de
  `src/routes/_authenticated.checkout.tsx`), atributos `label`/`aria-invalid`/`aria-describedby` nos
  formulários, `alt` em imagens relevantes, aviso explícito em rota fora de escopo (`/aprenda`) e
  anúncio de eventos em `aria-live="polite"`. Typecheck, lint (0 erros/9 avisos) e Vitest 18/18
  passaram. Próximo lote: grupo 12 (skeletons, falha e recuperação).
- Grupo 12 (e complemento do grupo 3) passou em `tests/e2e/loading-recovery.spec.ts`: **6/6** em
  Chromium desktop/mobile. Cobre skeletons `.shimmer` sob cenário `slow` com `prefers-reduced-motion:
reduce` e estabilidade dimensional sem layout shift, recuperação do erro 500 (`server-error`) no
  catálogo via `"Tentar novamente"`, expiração de sessão durante o checkout com retorno após login e
  preservação do rascunho (corrigida inicialização preguiçosa de `draft` em
  `src/routes/_authenticated.checkout.tsx` para não sobrescrever `sessionStorage` no `StrictMode`), e
  isolamento de carteiras, favoritos e carrinho entre Ana e Bruno. Typecheck, lint (0 erros/9 avisos) e
  Vitest 18/18 passaram. Próximo lote: Task 13 (regressão visual e overflow responsivo).
- Ajustada a liquidação do cenário `order-timeout` em `src/mocks/handlers.ts` para não emitir
  `order.updated` nem esvaziar o carrinho aos 2,5 s antes do timeout HTTP de 8 s do cliente, agendando a
  liquidação após a retomada idempotente; reposicionado o botão mobile do `MockPanel` para `bottom-28
right-3` para não sobrepor o controle de quantidade da barra fixa de `/nft/$id` em 390×844.
- Geradas e validadas as baselines de regressão visual (`home`, `nft-detail`, `cart` e `checkout`) em
  `tests/e2e/visual.spec.ts-snapshots/` para `desktop-chromium` (1440×1000) e `mobile-chromium`
  (390×844).
- Task 13 concluída com `tests/e2e/visual.spec.ts` e `playwright.config.ts` (`workers: 1`,
  `fullyParallel: false`): verificação de zero overflow horizontal em 390, 768 e 1440 px nas 6 rotas
  principais e comparação visual em desktop e mobile. A suíte Playwright completa rodou de ponta a
  ponta e passou com **88 aprovados, 2 skips mobile intencionais e 0 falhas**; `bun run build` também
  compilou em 316 ms sem aviso de chunk > 500 kB.
- Extraídas as regras puras de cupom/cotação (`src/lib/coupon.ts`) e de deduplicação/versão de eventos
  Socket.IO (`src/lib/event-guard.ts`), com testes unitários dedicados (`src/lib/coupon.test.ts` e
  `src/lib/event-guard.test.ts`), elevando a suíte Vitest para 9 arquivos e 24 testes.
- Substituído o carregamento externo do Google Fonts por arquivos locais `JetBrains Mono` (`.woff2`
  em `public/fonts/`) com `@font-face` em `src/styles.css` e `preload` em `src/routes/__root.tsx`,
  eliminando bloqueio de renderização externo; regressão visual (`visual.spec.ts`) passou 4/4 sem
  divergência de pixels.
- Escritos `ARCHITECTURE.md` (contratos REST, eventos Socket.IO, política de sessão, estado do
  carrinho, política de cache/retries, reconciliação REST × Socket.IO, transporte MSW, decisões de
  UX/acessibilidade e resumo dos desvios do Figma) e `README.md` completo (setup, variáveis de
  ambiente, credenciais fictícias, cupons, seleção/reset de cenários, reprodução de cada falha e
  comandos).
- Criada `docs/RETOMADA-IA.md` com objetivo, fontes, limites de evidência, commits, validações e
  sequência de pendências para permitir que outra sessão continue sem perder o contexto.
- Tornada explícita no `AGENTS.md` a execução em lotes pequenos, revisáveis e com commits separados.
- Usado o PNG composto do ZIP, o arquivo local de comentários e a gravação com pins para corrigir a composição mobile da
  home, detalhe, carrinho e checkout; ajustar autenticação e recibo para modal; criar destino de
  favoritos para o ícone da navegação; mapear comentários #47–#65 e registrar limites da comparação
  em `FIGMA-DEVIATIONS.md`.
- Completadas as seções abaixo do catálogo na home com o destaque de NFTs, banners promocionais e
  “Diário da Cunhagem”, conforme a captura fornecida; layout adaptado para desktop e mobile.
- A gravação adicional confirmou o frame do detalhe do NFT: galeria sem imagens de outras obras,
  miniaturas apenas no desktop e dados do Emerald Ape #042 alinhados a token, nota e avaliações.
- Corrigida a moldura desktop de login/cadastro conforme a gravação: abas de navegação com destino
  preservado, modal mais estreito e subtítulo escondido em mobile; teste cobre as rotas e o retorno.
- Alinhados os formulários de login/cadastro aos frames: placeholders em vez de rótulos visíveis,
  quatro campos de cadastro e provedores sociais empilhados; o contrato REST continua recebendo
  `displayName`, derivado do nome de usuário. Teste valida a quantidade de campos e o payload.
- Ajustado o diálogo mobile de autenticação para o cartão centralizado e arredondado mostrado no
  Figma, depois de confirmar o preenchimento indevido da tela numa captura em 390 px.
- Compactados os controles de autenticação mobile após a primeira captura do cartão revelar que o
  link inferior de cadastro ficava cortado; novo teste cobre alturas de campos e botões sociais.
- Estendidos os contratos e os dados mock do perfil para armazenar nome ENS e apelido da carteira;
  as regras são compartilhadas entre cliente e endpoint e cobertas por teste unitário.
- Alinhado o perfil desktop com o frame, integrando os campos ENS e apelido, o sufixo `.eth` e as
  ações de avatar/senha sem remover os dados de bio já editáveis.
- Limitados os campos de metadados do perfil a 63 caracteres para ENS e 40 para o apelido da
  carteira, com regressão unitária para valores acima do limite.
- Revisado o comentário #20: o checkout mobile mantém os dados do colecionador exigidos pelo fluxo;
  o frame mobile fornecido mostra apenas a etapa/seção de carteiras. A regra de ENS no checkout
  (#18) segue em aberto porque o próprio comentário pergunta qual comportamento desejam.
- Build de produção executado em 25/10/2026; compilação concluída sem erros. Permanecem 9 avisos
  de lint preexistentes e o bundle principal acima de 500 kB.
- Conferido o alinhamento da newsletter no rodapé desktop para o pin #65; a implementação já
  compartilha a linha de início dos textos com as colunas vizinhas.
- O frame completo também confirmou a composição assimétrica da oferta: Sage Nomad #046 em destaque,
  três cards Golden e paginação; a ordem inicial do catálogo foi alinhada aos itens visíveis.
- Ajustada a oferta para o card vertical e três cards quadrados, paginação clicável, dados de amostra
  consistentes e preços sem repetição de “ETH”.
- Nesta atualização: `typecheck`, `test` (8 casos), `build` e `lint` passaram; lint mantém 9 avisos
  preexistentes e o build reporta o bundle principal acima de 500 kB.
- `REQUISITOS.md` fica fora do repositório, no material do desafio. A matriz atualizada espelha seus
  itens, sem marcar como verificado item que ainda não tem teste automatizado ou medição registrada.
- Verificação inicial após as alterações: `typecheck`, `lint` (sem erros; avisos preexistentes) e
  `test` passaram. A validação visual em 390/768/1440 px ainda está em andamento.

## Diário

| Data       | Commit    | O que mudou                                       | Por quê                                                                                                                                 |
| ---------- | --------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 24/10/2026 | `2bdc7c4` | Commit inicial com a base do projeto limpa        | Ponto de partida do repositório                                                                                                         |
| 24/10/2026 | `281a72f` | `.gitattributes` com fim de linha LF              | O checkout no Windows gerava CRLF e o lint acusava milhares de erros falsos                                                             |
| 24/10/2026 | `4e37686` | `AGENTS.md` com as regras de trabalho             | Padronizar prioridades, stack, estado, testes e commits                                                                                 |
| 24/10/2026 | `de58a37` | Correção de 3 erros de tipo e script `typecheck`  | `onUnhandledRequest` virou `onUnhandledFrame` no MSW 3; unsubscribe devia retornar `void`; handler de favoritos sem retorno consistente |
| 25/10/2026 | `292d8dd` | Nota de retomada com contexto da auditoria        | Preservar fontes, decisões, limitações, testes e próximos passos entre sessões                                                          |
| 25/10/2026 | `d32144a` | Copy da campanha da home alinhada ao frame        | Remover “cultura”, ausente no frame visível; ação de cópia segue sem especificação                                                      |
| 25/10/2026 | `9347fa3` | Bloqueio da captura visual documentado            | Captura simples no navegador controlado também travou; evitar alegar verificação visual inexistente                                     |
| 25/10/2026 | `ed60376` | Lista de commits na nota de retomada formatada    | Corrigir whitespace em Markdown e ordenar a lista do mais recente para o mais antigo                                                    |
| 25/10/2026 | `13d301d` | Diário e nota de retomada atualizados             | Registrar lotes da retomada e deixar explícita a referência ao histórico Git                                                            |
| 25/10/2026 | `c96ef6f` | Correção de crash de navegação e fluxo de compra  | Corrigir bypass de navegação no MSW, regex de Socket.IO, validação de cupom no carrinho e chaves React duplicadas                       |
| 25/10/2026 | `d30eb00` | Organização dos testes unitários do carrinho      | Mover teste do carrinho para `src/test/` para isolar da árvore de rotas do TanStack Router                                              |
| 25/10/2026 | `b5205d8` | Ícone TrashFigmaIcon para remoção do carrinho     | Criar ícone idêntico ao vetor do Figma para exclusão de itens no carrinho                                                               |
| 25/10/2026 | `6d3fb87` | Alinhamento do carrinho mobile ao Figma (FD-19)   | Stepper e exclusão alinhados, cupom em pílula integrado e botão de checkout em pílula                                                   |
| 25/10/2026 | `975e002` | MobileTabBar curvada com entalhe central (FD-20)  | Navegação mobile com cantos curvos, entalhe SVG e botão flutuante para catálogo                                                         |
| 25/10/2026 | `20a8e04` | Hero mobile e grade escalonada ao Figma (FD-21)   | Anéis de gradiente, Sage Nomad sobreposto, cards com raridade e favoritos otimistas                                                     |
| 25/10/2026 | `cc6ce1e` | Detalhe mobile alinhado ao Figma (FD-22)          | Botões circulares no topo, barra fixa inferior curva e botão de compra em pílula                                                        |
| 25/10/2026 | `ae9de64` | Componentes de perfil e metadados de conta        | Componentes modulares para metadados ENS e apelido de carteira                                                                          |
| 25/10/2026 | `7b6d698` | Perfil e Carteiras alinhados ao Figma (FD-23)     | AccountNav com 8 itens, layout integrado no perfil e formulários completos de carteiras                                                 |
| 25/10/2026 | `bec8e95` | Botão Explorar padronizado em pílula (FD-24)      | Variante explore com cantos rounded-xl, fundo primário e seta à direita em todas as telas                                               |
| 25/10/2026 | `bf78d9a` | Botão 'Adicionar ao carrinho' no detalhe (FD-25)  | Ação explícita de adicionar ao carrinho com toast e variante line no detalhe                                                            |
| 25/10/2026 | `b14649d` | Testes E2E de conta e sessão                      | Cobrir autenticação, retorno seguro, cadastro, token inválido e troca de conta; corrigir o guard privado                                |
| 25/10/2026 | `5e00e02` | Testes E2E de favoritos                           | Cobrir estados de visitante/vazio, persistência, rollback da falha e nova tentativa                                                     |
| 25/10/2026 | `8be3b9a` | Testes E2E de carrinho                            | Cobrir quantidades, remoção, cupons, totais da cotação e migração do carrinho visitante                                                 |
| 25/10/2026 | `135c951` | Teste E2E de checkout confirmado                  | Cobrir conexão simulada, revisão, confirmação e restauração do recibo                                                                   |
| 25/10/2026 | `2ecbec7` | Testes E2E de falhas e idempotência no checkout   | Provar pagamento recusado, preço/estoque alterados, bloqueio de clique duplo e retry após timeout                                       |
| 25/10/2026 | `971c250` | Testes E2E de perfil e carteiras                  | Cobrir metadados, avatar, senha e criação/edição de carteiras em desktop e mobile                                                       |
| 25/10/2026 | `e9318e4` | Conexão Socket.IO sob MSW e testes do grupo 9     | Importar `socket.io-client` após o `worker.start()` e cobrir eventos e reconexão no checkout                                            |
| 25/10/2026 | `8ca0654` | Testes E2E de reconciliação Socket.IO no checkout | Cobrir confirmação por evento, mudança de preço/estoque no checkout e reconexão em desktop e mobile                                     |
| 25/10/2026 | `d42f3a7` | Testes E2E de versão e deduplicação de eventos    | Cobrir descarte de eventos duplicados/obsoletos, retomada de pedido pendente e snapshot do recibo                                       |
| 25/10/2026 | `7820f86` | Testes E2E de teclado, foco e validação acessível | Cobrir salto de conteúdo, focus trap/restauração em dialogs e atributos ARIA em desktop e mobile                                        |
| 25/10/2026 | `a81ae5b` | Testes E2E de skeletons, falha e recuperação      | Cobrir `.shimmer` com `prefers-reduced-motion`, recuperação de 500, expiração de sessão preservando rascunho e isolamento de contas     |
| 25/10/2026 | `79f198c` | Liquidação `order-timeout` e gatilho mobile MSW   | Aguardar retomada idempotente antes de liquidar o pedido em timeout e evitar sobreposição da barra de compra mobile em `/nft/$id`       |
| 25/10/2026 | `99043ab` | Baselines PNG de regressão visual                 | Versionar capturas de referência para início, detalhe, carrinho e pagamento em desktop (1440×1000) e mobile (390×844)                   |
| 25/10/2026 | `08e91dc` | Regressão visual e verificação responsiva E2E     | Validar ausência de overflow horizontal (390/768/1440 px), baselines visuais e suíte E2E completa (88 aprovados, 2 skips)               |
| 25/10/2026 | `77618e9` | Testes unitários de cupom e versão de eventos     | Extrair e testar `resolveCoupon`, `calculateQuoteTotals` e `createEventGuard` no Vitest (24/24)                                         |
| 25/10/2026 | `b03030c` | Fontes `JetBrains Mono` locais em `public/fonts`  | Eliminar requisição bloqueante ao Google Fonts mantendo fidelidade nos snapshots visuais                                                |
