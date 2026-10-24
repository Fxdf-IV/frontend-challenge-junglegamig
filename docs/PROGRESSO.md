# Progresso do projeto

Diário do que está sendo feito e lista de próximos passos. Atualizado a cada commit relevante
(regras em `AGENTS.md`, seção 13). Cobertura dos requisitos em `docs/REQUISITOS-COBERTURA.md`.

## Próximos passos (ordem de prioridade)

1. Formatar o código com Prettier para zerar o lint.
2. Revisar os pins de #47–#65 com a gravação recém-fornecida; validar visualmente no navegador os
   ajustes já feitos para #47–#63 e esclarecer o controle de cópia de #64.
3. Comentar todo o código (`AGENTS.md`, seção 12), pasta por pasta, em commits separados.
4. Auditar contratos e cenários dos mocks contra o enunciado; completar o painel de dev e o reset.
5. Revisar tempo real (deduplicação, versão, reconexão, reconciliação) e o checkout
   (revalidação, duplo clique, timeout com idempotência).
6. Perfil, carteiras e confirmação em mobile; acessibilidade (foco, dialogs, formulários, `aria-live`).
7. Performance: fontes locais (hoje vêm do Google Fonts), divisão de código, imagens com dimensões.
8. Playwright: configuração e os 12 grupos de teste, um commit por grupo; depois regressão visual.
9. Lighthouse: configuração, 3 medições por página e perfil, relatórios versionados.
10. `README.md` e `ARCHITECTURE.md` completos.
11. Configuração de deploy (fallback de SPA) e publicação.

### Bloqueios e decisões do usuário

- **Deploy público:** precisa da conta do usuário (Vercel, Netlify ou Cloudflare Pages) e da autorização
  para publicar.
- **Arquivo Figma:** a conta conectada segue como visualizadora e a API não lê o arquivo em modo somente visualização. A gravação
  fornecida permitiu localizar os pins #47–#65; observações genéricas e a interação de cópia #64
  ainda precisam de validação no front-end.

## Trabalho em andamento (24/10/2026)

- Usado o PNG composto do ZIP, o arquivo local de comentários e a gravação com pins para corrigir a composição mobile da
  home, detalhe, carrinho e checkout; ajustar autenticação e recibo para modal; criar destino de
  favoritos para o ícone da navegação; mapear comentários #47–#65 e registrar limites da comparação
  em `FIGMA-DEVIATIONS.md`.
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
