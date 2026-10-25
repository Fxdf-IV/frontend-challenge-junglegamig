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
7. Playwright: configuração e os 12 grupos de teste, um commit por grupo; depois regressão visual.
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

- Adicionado botão 'Adicionar ao carrinho' na tela de detalhe do NFT (`nft.$id.tsx`) no padrão visual do site (FD-25): implementado botão `variant="line"` com ícone `ShoppingCart`, tipografia mono e feedback imediato via toast sem forçar navegação, complementando a compra direta (`variant="brand"`) e o botão de favoritar (`Heart`), com ação `onAddToCart` unificada entre desktop e o botão móvel.
- Padronizado o botão 'Explorar →' em toda a aplicação conforme o modelo do Figma (FD-24): adicionada a variante `explore` em `button.tsx` com cantos `rounded-xl`, fundo primário sólido, texto escuro `text-primary-foreground` e tipografia `font-mono font-medium`; criado o componente reutilizável `ExploreButton.tsx`; e atualizados os botões do hero (`index.tsx`), das campanhas editoriais (`HomeEditorialSections.tsx`) e dos estados vazios (`favoritos.tsx`, `carrinho.tsx`, `_authenticated.checkout.tsx`).
- Alinhada a área do usuário (Perfil do colecionador e Carteiras) fielmente aos frames do Figma (FD-23): expandida a barra lateral `AccountNav.tsx` para 8 itens oficiais com indicador ativo de barra vertical laranja, ícone `MapPin` para Carteiras e ações fora de escopo tratadas como indisponíveis; reorganizado o perfil do colecionador em layout fluido sobre o canvas sem caixas isoladas, grade de 2 colunas com prefixo `.eth` à esquerda, avatar alinhado na 3ª linha, alternância de visibilidade nas senhas e botão `Salvar` unificado (`_authenticated.perfil.tsx`, `ProfileMetadataFields.tsx`, `Field.tsx`); e reestruturada a tela de carteiras com todos os 10 campos no formulário principal e estado vazio da carteira secundária com opção 'Igual à carteira principal' e ação 'Adicionar' (`_authenticated.carteiras.tsx`).

- Alinhada a tela mobile de detalhe do NFT ao Figma (FD-22): adicionados botões circulares no topo para voltar (`ChevronLeft`) e favoritar (`Heart`), barra inferior fixa com cantos superiores curvos `rounded-t-[1.5rem]`, stepper circular de quantidade `size-7`, preço total recalculado pela quantidade (`ethMul`), botão de compra em pílula `h-14 rounded-full` com gradiente primário e botão circular de adicionar ao carrinho em `#2f1d15` com feedback via toast (`nft.$id.tsx`).
- Alinhado o hero da Home mobile, a grade escalonada e os cards de NFT ao Figma (FD-21): restaurada a composição com anéis de gradiente `bg-hero-circles`, badge sobreposto Sage Nomad sobre Emerald Ape, CTA inline 'EXPLORAR ->', indicadores de carrossel, grade mobile em 2 colunas escalonadas (`max-md:*:even:translate-y-7`) e cards com selos de raridade ('RARO', etc.) e botão circular de favoritos com persistência e rollback otimista (`NftCard.tsx`, `Catalog.tsx`, `index.tsx`).
- Implementada a barra de navegação inferior mobile fiel ao Figma em `MobileTabBar.tsx` (FD-20): contêiner curvo `rounded-t-[2.5rem]`, entalhe central SVG recortado, botão flutuante com gradiente primário e ícone `ScanLine` para focar busca/catálogo, e 4 atalhos com ícones oficiais e indicação acessível de estado ativo.
- Alinhado o carrinho mobile ao Figma (FD-19): criado ícone vetorial `TrashFigmaIcon` com tampa reta, alça em arco e sem ranhuras internas em cor primária, reorganizada a linha de itens mobile com stepper e exclusão alinhados, input de cupom em pílula integrado com botão 'Aplicar' interno, cópia corrigida ('Desconto do lançamento', 'Taxa estimada') e botão full-width de checkout arredondado em pílula (`carrinho.tsx`).
- Atualizada a tipografia global para Roboto Mono com carregamento 100% local (`@fontsource/roboto-mono`), alinhando ao design do Figma e eliminando requisições externas ao Google Fonts em `styles.css` e `__root.tsx` (FD-18). Adicionado utilitário `bg-hero-circles` para os anéis de gradiente do hero mobile.
- Alinhado o modal de autenticação (`AuthShell.tsx`, `AuthForms.tsx`, `login.tsx`) ao frame do Figma
  (FD-17): cabeçalho inline `Entrar | Criar conta` com divisor vertical, barra laranja inferior no
  modal desktop, subtítulo e placeholders de login corrigidos (`contato@email.com` e `***********`),
  botão principal em caixa normal, divisor “Ou continue com” de ponta a ponta e botões sociais
  “Continuar com Google” e “Continuar com Facebook” com ícones SVG oficiais e borda escura.
- Posicionado o card vertical “NFT em destaque / Oferta limitada” abaixo do menu de filtros na coluna
  lateral do catálogo (`Catalog.tsx`), removendo a seção e a paginação duplicadas de
  `HomeEditorialSections.tsx` e alinhando as 3 fileiras iniciais do catálogo (`fixtures.ts`) e as 4
  páginas ao layout do Figma (FD-16, #26).
- Plano E2E salvo em `docs/superpowers/plans/2026-10-25-playwright-e2e.md`, dividido por grupo de
  requisito para preparar Playwright e avançar em commits pequenos.
- Preparado `.worktrees/` ignorado para executar a implementação E2E isolada em branch `codex/`,
  sem misturar os commits já feitos em `main` com os novos grupos de teste.
- Corrigida a cópia da campanha “Arte digital selecionada e muito mais” conforme o frame local (#64):
  removido o sufixo “cultura”; a ação de cópia segue indefinida no material disponível.
- A captura controlada da home desktop voltou a travar após mais de 60 segundos e foi interrompida;
  a revisão de renderização do navegador segue pendente, sem alegação de validação visual.
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
| 25/10/2026 | `d32144a` | Copy da campanha da home alinhada ao frame       | Remover “cultura”, ausente no frame visível; ação de cópia segue sem especificação                                                      |
| 25/10/2026 | `9347fa3` | Bloqueio da captura visual documentado           | Captura simples no navegador controlado também travou; evitar alegar verificação visual inexistente                                     |
| 25/10/2026 | `ed60376` | Lista de commits na nota de retomada formatada   | Corrigir whitespace em Markdown e ordenar a lista do mais recente para o mais antigo                                                    |
| 25/10/2026 | `13d301d` | Diário e nota de retomada atualizados            | Registrar lotes da retomada e deixar explícita a referência ao histórico Git                                                            |
| 25/10/2026 | `c96ef6f` | Correção de crash de navegação e fluxo de compra | Corrigir bypass de navegação no MSW, regex de Socket.IO, validação de cupom no carrinho e chaves React duplicadas                       |
| 25/10/2026 | `d30eb00` | Organização dos testes unitários do carrinho     | Mover teste do carrinho para `src/test/` para isolar da árvore de rotas do TanStack Router                                              |
