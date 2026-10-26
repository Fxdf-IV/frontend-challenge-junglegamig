# Relatório de Auditoria Lighthouse — Kurio NFT Marketplace

Relatório oficial consolidado de auditoria de performance, acessibilidade, melhores práticas e SEO, gerado a partir de 3 medições completas por alvo (12 execuções) no servidor de produção (`.output/server/index.mjs`) construído com `bun run build`.

## 1. Ambiente e Versões

| Parâmetro                  | Detalhe                                            |
| :------------------------- | :------------------------------------------------- |
| **Data e Hora**            | 2026-10-25T16:42:45.201Z                           |
| **Node.js**                | v24.16.0                                           |
| **Lighthouse CLI**         | 13.5.0                                             |
| **Sistema Operacional**    | Windows 11 (x64)                                   |
| **Processador / Hardware** | AMD Ryzen 7 9800X3D 8-Core Processor               |
| **Servidor de Produção**   | Nitro / Node.js HTTP Server (`PORT=4175`)          |
| **Modo de Execução**       | Build otimizado (`bun run build`), 3 runs por alvo |

---

## 2. Metas de Avaliação (Seção 10 de `REQUISITOS.md`)

- **Performance**: $\ge 90$
- **Acessibilidade**: $\ge 95$
- **Melhores Práticas**: $\ge 95$
- **SEO**: $\ge 90$

---

## 3. Resultados Consolidados (Medianas de 3 Execuções)

| Alvo                                     | Form Factor | Performance | Acessibilidade | Melhores Práticas |   SEO   |   LCP    |  CLS   | TBT  |
| :--------------------------------------- | :---------- | :---------: | :------------: | :---------------: | :-----: | :------: | :----: | :--: |
| **Início (`/`)**                         | Desktop     |   **100**   |    **100**     |      **100**      | **100** |  625 ms  | 0.0017 | 0 ms |
| **Detalhe NFT (`/nft/emerald-ape-042`)** | Desktop     |   **99**    |    **100**     |      **100**      | **100** |  914 ms  | 0.0002 | 0 ms |
| **Início (`/`)**                         | Mobile      |   **84**    |    **100**     |      **100**      | **100** | 4.339 ms | 0.0004 | 3 ms |
| **Detalhe NFT (`/nft/emerald-ape-042`)** | Mobile      |   **85**    |    **100**     |      **100**      | **100** | 4.304 ms | 0.0001 | 0 ms |

---

## 4. Análise Técnica e Comprovação Empírica (Mobile Performance)

Conforme estipulado na **Seção 10 de `REQUISITOS.md`** ("justificar o que ficar abaixo da meta sem simplificar a página só para pontuar"):

1. **Comprovação Empírica nos Relatórios: Execução Real (Trace) vs. Modelo Lantern:**
   - Nos relatórios oficiais (`reports/lighthouse/*.report.json`, chave `audits.metrics.details.items[0]`), o navegador registra as métricas reais observadas durante a renderização (sem desaceleração artificial):
     - **Início (Mobile) Real**: `observedFirstContentfulPaint` = **72 ms**, `observedLargestContentfulPaint` = **209 ms**, `observedSpeedIndex` = **116 ms**, `observedLoad` = **119 ms**.
     - **Detalhe NFT (Mobile) Real**: `observedFirstContentfulPaint` = **31 ms**, `observedLargestContentfulPaint` = **156 ms**, `observedSpeedIndex` = **132 ms**, `observedLoad` = **77 ms**.
     - Em ambos os casos, o LCP real ocorre em **menos de 210 ms** e o TBT é praticamente nulo (**0 a 3 ms**), com CLS excelente (**0.0001 a 0.0004**), mantendo 100/100 em Acessibilidade, Melhores Práticas e SEO.
   - **Simulação Matemática Lantern (Mobile Slow 4G + CPU 4× Throttling)**: O simulador Lantern extrapola o gráfico de dependências projetando latência de 150 ms e banda de 1.6 Mbps para cada script baixado sequencialmente antes da hidratação do cliente, o que projeta matematicamente o LCP para a faixa de ~4.3s.

2. **Impacto da Arquitetura Obrigatória de Mocks no Cliente:**
   - Em conformidade estrita com os critérios eliminatórios do desafio (**mocking 100% no cliente via Service Worker MSW e `@mswjs/socket.io-binding`, sem respostas fictícias em JSX ou SSR**), todas as consultas de catálogo e detalhe precisam ser capturadas e respondidas dinamicamente pelo Service Worker.
   - O simulador Lantern calcula sequencialmente o download de todos os pacotes de runtime (`@tanstack/react-router`, `@tanstack/react-query`, `axios`, `msw`) sob Slow 4G antes do disparo da requisição do cliente que renderiza o card/detalhe do NFT.

3. **Otimizações Implementadas no Build e Runtime:**
   - A página **não foi simplificada** artificialmente para burlar o simulador (não foram retirados nós do DOM, não foram usadas respostas embutidas nem removidos os componentes visuais ricos do Figma).
   - O projeto implementou otimizações legítimas de infraestrutura:
     - Pré-carregamento imediato no `<head>` (`<link rel="preload" as="image" href="/nft/emerald.webp" fetchPriority="high">`) tanto na Home quanto no Detalhe.
     - Imagens de catálogo visíveis acima da dobra marcadas com `priority={i === 0}` (`loading="eager"` e `fetchPriority="high"`).
     - Alinhamento de animações do Hero (`hero-copy-reveal` e `hero-stage-reveal`) mantendo opacidade inicial visível e animando translações, eliminando atrasos no LCP.
     - Indicadores de destaque do Hero mobile implementados como elementos visuais acessíveis (`aria-hidden="true"`), atingindo 100/100 cravado em Acessibilidade em todas as medições mobile e desktop.
     - Compressão Brotli e Gzip em todos os assets públicos e nas respostas HTML do SSR.
     - Code-splitting rigoroso por rota via `@tanstack/react-router`.
     - Tipografia 100% servida localmente (`@fontsource/roboto-mono`), sem requisições externas a CDN.

---

## 5. Relatórios Versionados

Os relatórios completos em formato HTML interativo e JSON estão disponíveis em:

- [Início Desktop HTML](../reports/lighthouse/home-desktop.report.html) / [JSON](../reports/lighthouse/home-desktop.report.json)
- [Início Mobile HTML](../reports/lighthouse/home-mobile.report.html) / [JSON](../reports/lighthouse/home-mobile.report.json)
- [Detalhe NFT Desktop HTML](../reports/lighthouse/detail-desktop.report.html) / [JSON](../reports/lighthouse/detail-desktop.report.json)
- [Detalhe NFT Mobile HTML](../reports/lighthouse/detail-mobile.report.html) / [JSON](../reports/lighthouse/detail-mobile.report.json)
- [Resumo Consolidado JSON](../reports/lighthouse/summary.json)
