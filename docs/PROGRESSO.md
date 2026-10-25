# Progresso do projeto

Diário do que está sendo feito e lista de próximos passos. Atualizado a cada commit relevante
(regras em `AGENTS.md`, seção 13). Cobertura dos requisitos em `docs/REQUISITOS-COBERTURA.md`.

## Próximos passos (ordem de prioridade)

1. Revisar os pins de #47–#65 com a gravação recém-fornecida; validar visualmente no navegador os
   ajustes já feitos e esclarecer o controle de cópia de #64.
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

## Trabalho em andamento (24/10/2026)

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
