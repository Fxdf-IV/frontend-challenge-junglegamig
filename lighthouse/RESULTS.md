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
| **Início (`/`)**                         | Desktop     |   **100**   |    **100**     |      **100**      | **100** |  615 ms  | 0.0019 | 0 ms |
| **Detalhe NFT (`/nft/emerald-ape-042`)** | Desktop     |   **99**    |    **100**     |      **100**      | **100** |  876 ms  | 0.0002 | 0 ms |
| **Início (`/`)**                         | Mobile      |   **87**    |    **100**     |      **100**      | **100** | 3.961 ms | 0.0005 | 0 ms |
| **Detalhe NFT (`/nft/emerald-ape-042`)** | Mobile      |   **86**    |    **100**     |      **100**      | **100** | 4.048 ms | 0.0001 | 0 ms |

---

## 4. Análise Técnica e Justificativa (Mobile Performance)

Conforme estipulado na **Seção 10 de `REQUISITOS.md`** ("justificar o que ficar abaixo da meta sem simplificar a página só para pontuar"):

1. **Performance Real vs. Simulação Lantern:**
   - **Medição Real no Dispositivo**: O Largest Contentful Paint (LCP) real observado durante a renderização no navegador ocorre em **249 ms** na Home e em **196 ms** no Detalhe do NFT. O Total Blocking Time (TBT) é nulo (**0 ms**), demonstrando ausência de tarefas longas de JavaScript travando a thread principal. O Cumulative Layout Shift (CLS) é de apenas **0.0001 a 0.0005**, bem abaixo do teto de 0.1 da Google.
   - **Simulação Matemática Lantern (Mobile Slow 4G + CPU 4× Throttling)**: O Lighthouse aplica matematicamente uma emulação severa de dispositivo móvel de entrada (CPU limitada a 4× de desaceleração e rede com 1.6 Mbps de banda e 150 ms de RTT).

2. **Impacto da Arquitetura Obrigatória de Mocks no Cliente:**
   - Em conformidade estrita com os critérios eliminatórios do desafio (**mocking 100% no cliente via Service Worker MSW e `@mswjs/socket.io-binding`, sem respostas fictícias em JSX ou SSR**), todas as consultas de catálogo e detalhe precisam ser capturadas e respondidas dinamicamente pelo Service Worker.
   - No modelo Lantern, o tempo de inicialização e ativação do Service Worker sob emulação de CPU 4× e latência de 150 ms é extrapolado sequencialmente, projetando o LCP estimado em ~3.9s–4.0s (gerando pontuações entre 86 e 87).

3. **Decisão de Arquitetura**:
   - A página **não foi simplificada** artificialmente para burlar o simulador (não foram retirados nós do DOM, não foram usadas respostas embutidas nem removidos os componentes visuais ricos do Figma).
   - O projeto implementou otimizações legítimas de infraestrutura:
     - Compressão Brotli e Gzip em todos os assets públicos e nas respostas HTML do SSR.
     - Pré-carregamento imediato (`fetchpriority="high"`, `<link rel="preload">`) das imagens LCP locais no `<head>`.
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
