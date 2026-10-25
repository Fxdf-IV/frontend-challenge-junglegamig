# Registro de comparação com o Figma

Fontes consultadas: export `Frontend Challenge.png`, `Comentários-Figma.txt` e gravações de tela
`Gravação de Tela 2026-10-24 200402.mp4` e `Gravando 2026-10-24 202119.mp4`. As gravações mostram
o canvas e os frames em modo somente visualização. Os alvos abaixo foram identificados pela tela/camada e posição do pin. Opiniões e
perguntas dos comentários foram tratadas como observações para revisão, não como requisitos novos.

## Comentários com posição identificada na gravação

| ID | Frame / alvo do pin | Observação registrada | Situação no front-end |
| --- | --- | --- | --- |
| #65 | Início desktop, bloco de newsletter no rodapé; perto do formulário de e-mail/Enviar | “O alinhamento horizontal dos textos dessa div com as demais parece incorreto.” | Conferido no frame do rodapé: título, campo, botão e texto auxiliar compartilham a borda esquerda, como as três colunas vizinhas; o `Footer.tsx` mantém esse alinhamento dentro da grade de quatro colunas. |
| #64 | Início desktop, seção promocional com a descrição “Arte digital selecionada e muito mais” e botão Explorar | “quando clica para copiar o texto aparece no final cultura porém no design ela não aparece” | O frame local da seção mostra a frase terminando em “definem a”; removido “cultura” da descrição em `HomeEditorialSections.tsx`. A gravação não identifica qual controle copia o texto; essa ação continua sem especificação verificável. |
| #63 | Início mobile, imagem pequena de Sage Nomad sobreposta ao destaque Emerald Ape | “esta imagem nao deveria estar aqui” | A composição mobile mantém somente a imagem principal do hero; os outros NFTs aparecem na grade abaixo. A imagem sobreposta foi removida. `index.tsx`. |
| #61 | Início desktop, espaço vertical entre primeira e segunda fileira da grade | “O espaço vertical entre a primeira e a segunda fileira de cards está menor do que o espaço entre a segunda e a terceira fileira.” | Gap vertical separado e ampliado na grade. `Catalog.tsx`. |
| #60 | Início desktop, primeira coluna da grade; primeiro card da segunda fileira, Cosmic Bloom #118, em relação ao Emerald Ape #842 e aos filtros | “O primeiro card da segunda linha (\"Cosmic Bloom #118\") está visivelmente desalinhado para a esquerda em relação ao card de cima (\"Emerald Ape #842\"). Toda a primeira coluna de cards está desalinhada com o título \"Coleções\" e os filtros da barra lateral.” | A grade é alinhada por CSS Grid, sem deslocamento individual por card; a posição da coluna é compartilhada entre as fileiras. Confirmar na captura desktop final. `Catalog.tsx`. |
| #59 | Início desktop, links centrais do header (Início, Mercado, Criadores, Aprenda) | Menu central ligeiramente fora do eixo vertical do logo e dos botões laterais. | Header usa trilho central de uma grade de três colunas com alinhamento vertical central. `Header.tsx`. |
| #58 | Cadastro desktop, modal “Criar conta” e seu fundo | Backdrop escuro ausente atrás do modal. | Radix Dialog aplica overlay escuro e bloqueia interação com a página ao fundo. `AuthShell.tsx`, `dialog.tsx`. |
| #57 | Início desktop, bloco de conteúdo/artigo abaixo do hero, pin na área lateral do bloco | “esta empurrado para o lado esquerdo, nao esta centralizado” | Container do conteúdo usa largura responsiva e centralização do layout. Manter revisão visual; comentário não indica qual subelemento deve mudar. |
| #56 | Início desktop, mídia de NFT no catálogo/destaque; pin na borda da imagem | “O bg ta saindo da imagem.” | Imagens do catálogo ficam recortadas pelo contêiner (`overflow-hidden`); hero usa `object-cover`. Verificar no desktop final. |
| #55 | Detalhe desktop, linha superior de navegação/ações | “Margin não uniforme” | Espaçamentos do header são definidos pelo mesmo grupo de layout. O comentário não especifica quais margens comparar. |
| #54 | Pagamento desktop, seletor “Selecione uma rede” do perfil do colecionador | “Falta centralizar esse icone” | Ícone/caret permanece alinhado ao centro do controle. Revisar com a captura final da tela. |
| #53 | Pagamento desktop, seção Carteira e rede, junto à opção de carteira conectada | “Falta uma margin aqui.” | Alvo localizado, mas o comentário não define o lado nem o valor da margem; não foi alterado por suposição. |
| #52 | Pagamento desktop, botão Confirmar compra | “Falta um padding aqui pra uniformizar.” | Botão usa padding consistente do componente compartilhado. Confirmar visualmente no fluxo de pagamento. |
| #51 | Confirmação desktop, totais e texto de transação confirmada | “Faltou deixar os textos mais para a direita.” | O conteúdo de confirmação fica dentro do container central do recibo; validar o alinhamento após captura final. |
| #50 | Grade desktop de NFTs, contêiner da coluna de cards | “Falta centralização do container” | A grade está dentro do container de página e segue colunas compartilhadas. Revalidar a composição com filtros na captura final. |
| #49 | Carrinho desktop, ícone de remover em uma linha de item | “Falta centralizar o icone” | Ícone centralizado no botão quadrado de ação. `carrinho.tsx`. |
| #48 | Cadastro desktop, formulário “Criar perfil de colecionador” | “Falta de uniformidade, texto centralizado porem o resto dos campos não são centralizados.” | Wrapper do formulário centralizado; conteúdo dos campos permanece alinhado à esquerda, como nos próprios controles do frame. `AuthShell.tsx`, `AuthForms.tsx`. |
| #47 | Carrinho mobile, controle de quantidade da linha Violet Nomad | “Falta de centralização.” | Controles +/- e quantidade ficam no mesmo grupo centralizado no card. `carrinho.tsx`. |

## Outras observações visíveis na mesma gravação

Os comentários abaixo aparecem na lista durante a gravação, mas estão fora da faixa #47–#65 do
arquivo de texto anexado. São perguntas, sugestões ou observações históricas; ficam registrados para
consulta e não são tratados automaticamente como requisitos de produto.

| ID | Frame / alvo indicado | Observação resumida da lista | Leitura |
| --- | --- | --- | --- |
| #46 | Carrinho | “Badge com round não necessário.” | Opinião visual sobre o badge/controle arredondado. |
| #45 | Grade de NFTs | “Itens não nivelado.” | Nivelamento dos cards. |
| #44 | Carrinho | Falta de margem. | Não especifica lado/valor. |
| #43 | Rodapé, bloco “Carteiras compatíveis” | Falta de padding. | Alvo visível; sem medida definida. |
| #42 | Bloco de conteúdo/descrição | Texto muito próximo. | Não especifica elemento vizinho. |
| #41 | Controle de quantidade | Ícone desproporcional ao botão. | Ícone +/- do stepper. |
| #40 | Navegação do perfil | Aumentar padding e uniformizar. | Pin na opção de sair/perfil. |
| #39 | Ação em bloco de conteúdo | “Melhor um full widget button aqui.” | Sugestão de componente, não requisito. |
| #38 | Botão | Centralizar o texto. | Ajuste de alinhamento do rótulo. |
| #37 | Texto de conteúdo | Melhorar tipografia. | Sugestão sem especificar fonte/tamanho. |
| #36 | Elemento de conteúdo | Centralizar. | Não nomeia o elemento. |
| #35 | Título da tela de autenticação | Melhorar tipografia e aproximar do título. | Ajuste de hierarquia/espacamento do formulário. |
| #34 | Formulário de autenticação | Uniformizar UI. | Genérico. |
| #33 | Carrinho, stepper | “Botão sem raio.” | Sugere borda arredondada nos controles. |
| #32 | Imagem/card de NFT | Unificar o background. | Fundo visual do card/imagem. |
| #31 | Card/área de conteúdo | Falta uniformidade. | Genérico. |
| #30 | Card/área de conteúdo | Falta uniformidade. | Genérico. |
| #29 | Card de NFT | Fundo descentralizado em relação à imagem. | Alinhamento do fundo e da imagem. |
| #28 | Botão | Centralizar. | O alvo específico não fica legível no quadro capturado. |
| #27 | Área de conteúdo | Falta margem. | Não especifica lado/valor. |
| #26 | Início desktop, banner “NFT em destaque” | Texto sem alinhamento. | Alvo visível no banner. |
| #25 | Botão | Não está centralizado. | O alvo específico não fica legível no quadro capturado. |
| #24 | Detalhe do NFT, seletor de miniaturas | Miniaturas muito próximas da imagem; deslocar para baixo para não serem cobertas pelo seletor. | No desktop, miniaturas seguem em coluna independente à esquerda da mídia. A nova gravação mostra quatro miniaturas do mesmo NFT; imagens de outras obras foram removidas da galeria. |
| #23 | Detalhe do NFT, galeria | Pergunta se as miniaturas são edições ou variações. | A nova gravação mostra o mesmo NFT nas quatro miniaturas; a implementação não associa miniaturas a NFTs diferentes. A intenção de edição/variação permanece sem especificação. |
| #22 | Não legível nos quadros extraídos | Texto não foi recuperado com confiança. | Pendente de imagem mais nítida. |
| #21 | Carrinho/pagamento, ID de token | IDs exibidos parecem divergentes e pede confirmação do valor. | A gravação confirma o Emerald Ape #042 com token #0042; o fixture do item de referência foi alinhado a esses IDs. |
| #20 | Pagamento mobile | Questiona por que o formulário “Perfil do colecionador” de 10 campos aparece no desktop, mas no mobile só aparece escolha de carteira. | O frame mobile enquadra a escolha de carteira, mas os campos de nome, e-mail e observação seguem disponíveis no checkout responsivo porque o fluxo exige os dados do colecionador. Não ocultar campos obrigatórios para imitar um frame parcial. |
| #19 | Confirmação | Questiona estados pendente/confirmado/recusado e observa que só o confirmado está desenhado. | O front-end já trata os três estados; o comentário não pede remover os estados. |
| #18 | Pagamento, rede | Pergunta se ENS é só Ethereum e se precisa de dropdown. | Pergunta de fluxo; manter como questão de produto. |
| #17 | Início, cards informativos do rodapé | Sugere ícones que ilustrem o texto em vez de letras sem informação. | Sugestão visual; não altera fluxo. |
| #16 | Carrinho, ações da linha | Falta espaço para o botão de excluir. | Ação de remover precisa permanecer visível sem sobrepor conteúdo. |
| #15 | Carrinho, controles de quantidade | Stepper desktop e mobile deveriam ser iguais para reduzir manutenção e manter coerência. | Consistência entre breakpoints. |
| #14 | Ação após login | Pergunta se o botão permanece depois de entrar. | Comportamento depende do estado de sessão. |
| #13 | Card de NFT | Pergunta se o fundo do card deve ter cor diferente. | Pergunta estética; manter tokens do design. |
| #12 | Perfil/coleções | Pergunta se as coleções devem estar em ordem alfabética. | Sugestão de ordenação. |
| #11 | Início desktop, header | Observa que o header desta tela tem borda inferior que as outras telas não têm. | Consistência entre cabeçalhos. |
| #10 | Pagamento/carrinho, quantidade | Sugere desabilitar o controle se 1 for a quantidade mínima. | Já respeita mínimo 1 e desabilita decremento. |
| #9 | Sistema de cores | Pergunta se haverá tema claro e se precisará da mesma paleta nesse tema. | Pergunta de escopo de produto. |
| #8 | Botão isolado | Pergunta o que o botão faz. | Rótulo/propósito precisa ser claro no contexto. |
| #7 | Paginação | Pergunta se deve haver botão de voltar quando estiver na página 2. | Pergunta de navegação; navegador e paginação existentes devem ser avaliados juntos. |
| #6 | Catálogo | Pergunta quais são as opções de ordenação. | As opções existentes estão no seletor de ordenação. |
| #5 | Catálogo, faixa de preço | Sugere usar valores mínimo/máximo em campos para facilitar a precisão em mobile. | Sugestão de usabilidade responsiva. |
| #4 | Catálogo, filtros | Sugere checkboxes para combinar filtros e indicar o que está selecionado. | O estado atual permite combinar facetas e mostra estado acessível pressionado; conferir a apresentação visual. |
| #3 | Frames mobile/tablet | Observa ausência de confirmação, perfil e carteiras em mobile, e de referências tablet. | Limite dos frames exportados; não prova que essas rotas devam ser ocultadas. |

## Alterações visuais já aplicadas

| ID | Tela | Alteração |
| --- | --- | --- |
| FD-01 | Home mobile | Busca e filtro no topo; hero compacto em duas colunas; copy responsiva. |
| FD-02 | Navegação mobile | Barra inferior com quatro ícones acessíveis e rota de favoritos. |
| FD-03 | Detalhe mobile | Cabeçalho compacto e barra fixa de compra. |
| FD-04 | Carrinho mobile | Resumo/cupom fixo com rolagem própria; controles e linhas adaptados ao frame. |
| FD-05 | Checkout mobile | Retorno ao carrinho e revisão acessível junto ao rodapé. |
| FD-06 | Login/cadastro | Modal com backdrop, foco gerenciado e conteúdo de fundo inerte. |
| FD-07 | Login/cadastro | Recuperação de senha e controles sociais visíveis; integrações indisponíveis informadas sem simular sucesso. |
| FD-08 | Confirmação | Recibo confirmado apresentado em modal; estados pendente e recusado preservados. |
| FD-09 | Início desktop e mobile | As seções “NFT em destaque”, campanhas e “Diário da Cunhagem” do frame estavam ausentes na implementação. | Incluídos um card vertical Sage Nomad #046, três cards Golden, paginação com quatro páginas, dois banners e quatro cards editoriais em `HomeEditorialSections.tsx`, com layout responsivo. |
| FD-10 | Detalhe desktop e mobile | A galeria usava imagens de outros NFTs e a tela mobile mostrava miniaturas que não aparecem no frame; a identificação do item de referência também divergia. | Galeria limitada à arte do NFT, miniaturas ocultas no mobile e fixture Emerald Ape alinhado a #042, token #0042, 4.8/19 avaliações. |
| FD-11 | Login/cadastro desktop e mobile | A moldura atual não tinha as abas desktop do Figma, usava modal largo e exibia subtítulo no mobile. | Abas Entrar/Criar conta com rota ativa e `redirect` preservado, modal desktop mais estreito, título no mobile e subtítulo apenas no desktop em `AuthShell.tsx` e rotas públicas. |
| FD-12 | Login/cadastro desktop e mobile | Cadastro mostrava um campo de nome de exibição adicional, os rótulos ocupavam espaço visual e os provedores sociais ficavam lado a lado no desktop. | Formulário segue os quatro campos do frame, mantém rótulos acessíveis ocultos visualmente, preenche `displayName` com o nome de usuário para preservar o contrato REST e empilha Google/Facebook em `AuthForms.tsx`. |
| FD-13 | Login/cadastro mobile | O diálogo ocupava toda a viewport, enquanto os frames mostram um cartão estreito e arredondado centralizado sobre fundo escuro; o primeiro ajuste ainda cortava o link inferior do formulário. | Modal mobile mede 278 × 600 px (limitado pela altura disponível), centralizado e arredondado; campos, espaçamentos e botões sociais compactam para manter o link no cartão em `AuthShell.tsx` e `AuthForms.tsx`. |
| FD-14 | Perfil desktop | O perfil não tinha os campos de nome ENS e apelido da carteira presentes no frame, e as ações do avatar e senha diferiam na posição e no rótulo. | Acrescentados nome ENS com sufixo `.eth` e apelido da carteira, mantendo bio e recursos de avatar/senha; o botão de perfil passa a dizer “Salvar” e o avatar segue com Alterar/Remover. Dados e validação persistem pelo contrato `/me`. |
| FD-15 (#64) | Home desktop, campanha “Arte digital selecionada e muito mais” | A descrição da implementação terminava com “cultura”, trecho ausente no texto visível do frame. | Removido o sufixo “cultura” em `HomeEditorialSections.tsx`; a ação de cópia citada no comentário não é mostrada na gravação e segue sem comportamento presumido. |

## Limites da comparação

- A conta Figma conectada continua em modo de visualização e a API do Figma rejeitou leitura do
  arquivo; portanto comentários não puderam ser exportados por API.
- As gravações fornecidas permitiram associar pins e frames para #47–#65, confirmar detalhes de
  produto e mostrar comentários mais antigos.
  Algumas frases ainda não especificam o ajuste desejado ou não revelam o resultado da interação.
- `REQUISITOS.md` fica fora do repositório, no material do desafio. A matriz
  `docs/REQUISITOS-COBERTURA.md` espelha seus itens; não foram inventados itens ausentes.
