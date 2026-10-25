# Progresso do projeto

Diário do que está sendo feito e lista de próximos passos. Atualizado a cada commit relevante
(regras em `AGENTS.md`, seção 13). Cobertura dos requisitos em `docs/REQUISITOS-COBERTURA.md`.

## Próximos passos (ordem de prioridade)

1. Revisar os pins de #47–#65 com a gravação recém-fornecida; validar visualmente no navegador os
   ajustes já feitos (a ferramenta de captura controlada trava até numa captura simples) e esclarecer
   o controle de cópia de #64.
2. Comentar todo o código (`AGENTS.md`, seção 12), pasta por pasta, em commits separados.
3. Auditar contratos e cenários dos mocks contra o enunciado; completar o painel de dev e o reset.
4. Revisar tempo real (deduplicação, versão, reconexão, reconciliação) e o checkout
   (revalidação, duplo clique, timeout com idempotência).
5. Perfil, carteiras e confirmação em mobile; acessibilidade (foco, dialogs, formulários, `aria-live`).
6. Performance: fontes locais (hoje vêm do Google Fonts), divisão de código, imagens com dimensões.
7. Playwright: grupos 1–8 verificados; grupo 3 parcial; faltam grupos 9–12 e regressão visual.
8. Lighthouse: configuração, 3 medições por página e perfil, relatórios versionados.
9. `README.md` e `ARCHITECTURE.md` completos.
10. Formatar o código com Prettier para zerar o lint.
11. Configuração de deploy (fallback de SPA) e publicação.

### Bloqueios e decisões do usuário

- **Deploy público:** precisa da conta do usuário (Vercel, Netlify ou Cloudflare Pages) e da autorização
  para publicar.
- **Arquivo Figma:** a conta conectada segue como visualizadora e a API não lê o arquivo em modo somente visualização. A gravação
  fornecida permitiu localizar os pins #47–#65; observações genéricas e a interação de cópia #64
  ainda precisam de validação no front-end.

## Trabalho em andamento (24–25/10/2026)

- Adicionada base Playwright com projetos Chromium 1440×1000 e 390×844, execução pelo servidor Vite
  isolado e smoke test das seções da home. `bun run test:e2e` passou nos dois viewports; só cobre o
  início e não verifica os demais grupos nem regressão visual.
- `bun run typecheck`, `bun run test` (18 testes) e `bun run lint` passaram; lint mantém 9 avisos.
  Uma execução simultânea de lint/E2E encontrou uma condição de corrida no diretório temporário; o
  lint foi repetido sozinho e passou. Os comandos devem ser executados em sequência durante o commit.
- Relatório e resultados temporários do Playwright (`playwright-report/`, `test-results/`) foram
  excluídos do Git; a matriz registra apenas a configuração e o smoke test efetivamente comprovados.
- Fechado o grupo 1 de E2E: busca, filtro, ordenação desktop, paginação, histórico, vazio e resposta
  com latência variável passam em Chromium. A ordenação não é exercitada em mobile porque o controle
  não aparece no frame mobile disponível; 1 teste fica intencionalmente pulado nesse projeto.
- Commit inicial Playwright (`2a30fb6`) adicionou configuração, smoke da home e instruções README;
  ajuste de matriz (`0149b16`) registrou a cobertura parcial e ignorou relatórios locais.
- Suíte atual após os grupos 1 e 2: 19 E2E passaram e 1 foi pulado; 18 Vitest passaram; typecheck
  limpo; lint sem erros, com 9 avisos existentes.
- Grupo 2 de E2E: acesso direto, 404, edição, quantidade/carrinho, redirecionamento de visitante e
  ausência de warning de chave duplicada passam em desktop e mobile. A repetição das quatro imagens
  da galeria gerava keys React idênticas; cada `<li>` agora combina caminho da imagem e índice.
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

| Data       | Commit    | O que mudou                                      | Por quê                                                                                                                                 |
| ---------- | --------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 24/10/2026 | `2bdc7c4` | Commit inicial com a base do projeto limpa       | Ponto de partida do repositório                                                                                                         |
| 24/10/2026 | `281a72f` | `.gitattributes` com fim de linha LF             | O checkout no Windows gerava CRLF e o lint acusava milhares de erros falsos                                                             |
| 24/10/2026 | `4e37686` | `AGENTS.md` com as regras de trabalho            | Padronizar prioridades, stack, estado, testes e commits                                                                                 |
| 24/10/2026 | `de58a37` | Correção de 3 erros de tipo e script `typecheck` | `onUnhandledRequest` virou `onUnhandledFrame` no MSW 3; unsubscribe devia retornar `void`; handler de favoritos sem retorno consistente |
| 25/10/2026 | `292d8dd` | Nota de retomada com contexto da auditoria       | Preservar fontes, decisões, limitações, testes e próximos passos entre sessões                                                          |
| 25/10/2026 | `d32144a` | Copy da campanha da home alinhada ao frame       | Remover “cultura”, ausente no frame visível; ação de cópia segue sem especificação                                                     |
| 25/10/2026 | `9347fa3` | Bloqueio da captura visual documentado          | Captura simples no navegador controlado também travou; evitar alegar verificação visual inexistente                                    |
| 25/10/2026 | `ed60376` | Lista de commits na nota de retomada formatada   | Corrigir whitespace em Markdown e ordenar a lista do mais recente para o mais antigo                                                   |
| 25/10/2026 | `13d301d` | Diário e nota de retomada atualizados            | Registrar lotes da retomada e deixar explícita a referência ao histórico Git                                                           |
| 25/10/2026 | `b14649d` | Testes E2E de conta e sessão                     | Cobrir autenticação, retorno seguro, cadastro, token inválido e troca de conta; corrigir o guard privado                              |
| 25/10/2026 | `5e00e02` | Testes E2E de favoritos                          | Cobrir estados de visitante/vazio, persistência, rollback da falha e nova tentativa                                                   |
| 25/10/2026 | `8be3b9a` | Testes E2E de carrinho                           | Cobrir quantidades, remoção, cupons, totais da cotação e migração do carrinho visitante                                              |
| 25/10/2026 | `135c951` | Teste E2E de checkout confirmado                 | Cobrir conexão simulada, revisão, confirmação e restauração do recibo                                                               |
| 25/10/2026 | `2ecbec7` | Testes E2E de falhas e idempotência no checkout  | Provar pagamento recusado, preço/estoque alterados, bloqueio de clique duplo e retry após timeout                                   |
| 25/10/2026 | `971c250` | Testes E2E de perfil e carteiras                 | Cobrir metadados, avatar, senha e criação/edição de carteiras em desktop e mobile                                                   |
