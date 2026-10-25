// Script de auditoria Lighthouse: constrói o bundle de produção, inicia o servidor
// SSR local e executa 3 medições (mobile e desktop) em Início e Detalhe com cálculo de mediana.

import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Calcula a mediana numérica de uma lista de valores ordenáveis.
 */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(3))
    : sorted[mid];
}

/**
 * Aguarda o servidor HTTP local responder 200 antes de iniciar o Lighthouse.
 */
async function waitForServer(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Servidor ainda iniciando; aguarda próximo ciclo.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Servidor não respondeu em ${url} após ${timeoutMs}ms.`);
}

/**
 * Executa a suíte de auditoria Lighthouse conforme definido em lighthouserc.json.
 */
async function main() {
  const rootDir = process.cwd();
  const configPath = path.join(rootDir, "lighthouserc.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  const args = process.argv.slice(2);
  const skipBuild = args.includes("--no-build");
  const runsArg = args.find((arg) => arg.startsWith("--runs="));
  const runsCount = runsArg ? Number(runsArg.split("=")[1]) : config.runs;

  if (!skipBuild) {
    console.log("Construindo build otimizado de produção...");
    execFileSync("bun", ["run", "build"], { stdio: "inherit", cwd: rootDir, shell: true });
  }

  const outputDir = path.join(rootDir, config.outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  const port = String(config.port ?? 4175);
  const baseUrl = `http://127.0.0.1:${port}`;
  const serverEntry = path.join(rootDir, ".output", "server", "index.mjs");

  const serverProc = spawn(process.execPath, [serverEntry], {
    cwd: rootDir,
    env: { ...process.env, PORT: port, HOST: "127.0.0.1" },
    stdio: "ignore",
  });

  try {
    await waitForServer(`${baseUrl}/`);
    const lhCli = path.join(rootDir, "node_modules", "lighthouse", "cli", "index.js");
    const lhPkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, "node_modules", "lighthouse", "package.json"), "utf8"),
    );

    const results = [];

    for (const target of config.targets) {
      const targetUrl = `${baseUrl}${target.path}`;
      const runRecords = [];

      for (let runIndex = 1; runIndex <= runsCount; runIndex += 1) {
        const prefix = path.join(outputDir, `${target.id}-run${runIndex}`);
        const extraFlags = target.formFactor === "desktop" ? ["--preset=desktop"] : [];

        console.log(`[${target.id}] medição ${runIndex}/${runsCount} -> ${targetUrl}`);
        execFileSync(
          process.execPath,
          [
            lhCli,
            targetUrl,
            "--output=json,html",
            `--output-path=${prefix}`,
            "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
            "--only-categories=performance,accessibility,best-practices,seo",
            "--quiet",
            ...extraFlags,
          ],
          { stdio: "inherit", cwd: rootDir },
        );

        const jsonPath = `${prefix}.report.json`;
        const htmlPath = `${prefix}.report.html`;
        const report = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        const scores = {
          performance: Math.round((report.categories.performance?.score ?? 0) * 100),
          accessibility: Math.round((report.categories.accessibility?.score ?? 0) * 100),
          bestPractices: Math.round((report.categories["best-practices"]?.score ?? 0) * 100),
          seo: Math.round((report.categories.seo?.score ?? 0) * 100),
        };
        const metrics = {
          lcpMs: Math.round(report.audits["largest-contentful-paint"]?.numericValue ?? 0),
          lcpDisplay: report.audits["largest-contentful-paint"]?.displayValue ?? "",
          cls: Number((report.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(4)),
          clsDisplay: report.audits["cumulative-layout-shift"]?.displayValue ?? "",
          tbtMs: Math.round(report.audits["total-blocking-time"]?.numericValue ?? 0),
          tbtDisplay: report.audits["total-blocking-time"]?.displayValue ?? "",
        };

        runRecords.push({ run: runIndex, scores, metrics, jsonPath, htmlPath });
      }

      const medianScores = {
        performance: median(runRecords.map((r) => r.scores.performance)),
        accessibility: median(runRecords.map((r) => r.scores.accessibility)),
        bestPractices: median(runRecords.map((r) => r.scores.bestPractices)),
        seo: median(runRecords.map((r) => r.scores.seo)),
      };
      const medianMetrics = {
        lcpMs: median(runRecords.map((r) => r.metrics.lcpMs)),
        cls: median(runRecords.map((r) => r.metrics.cls)),
        tbtMs: median(runRecords.map((r) => r.metrics.tbtMs)),
      };

      // Seleciona a execução mais próxima da mediana de performance e LCP para versionar HTML/JSON.
      const representative = [...runRecords].sort((a, b) => {
        const diffA =
          Math.abs(a.scores.performance - medianScores.performance) * 1000 +
          Math.abs(a.metrics.lcpMs - medianMetrics.lcpMs);
        const diffB =
          Math.abs(b.scores.performance - medianScores.performance) * 1000 +
          Math.abs(b.metrics.lcpMs - medianMetrics.lcpMs);
        return diffA - diffB;
      })[0];

      const finalJson = path.join(outputDir, `${target.id}.report.json`);
      const finalHtml = path.join(outputDir, `${target.id}.report.html`);
      fs.copyFileSync(representative.jsonPath, finalJson);
      fs.copyFileSync(representative.htmlPath, finalHtml);

      for (const rec of runRecords) {
        fs.rmSync(rec.jsonPath, { force: true });
        fs.rmSync(rec.htmlPath, { force: true });
      }

      console.log(
        `[${target.id}] mediana -> Perf: ${medianScores.performance} | A11y: ${medianScores.accessibility} | BP: ${medianScores.bestPractices} | SEO: ${medianScores.seo} | LCP: ${medianMetrics.lcpMs}ms | CLS: ${medianMetrics.cls} | TBT: ${medianMetrics.tbtMs}ms`,
      );

      results.push({
        id: target.id,
        label: target.label,
        path: target.path,
        formFactor: target.formFactor,
        medianScores,
        medianMetrics,
        representativeRun: representative.run,
        runs: runRecords.map(({ run, scores, metrics }) => ({ run, scores, metrics })),
      });
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      environment: {
        node: process.version,
        lighthouse: lhPkg.version,
        platform: `${os.platform()} ${os.release()} (${os.arch()})`,
        cpu: os.cpus()[0]?.model ?? "unknown",
        runsPerTarget: runsCount,
      },
      thresholds: config.thresholds,
      targets: results,
    };

    const summaryPath = path.join(outputDir, "summary.json");
    fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Resumo salvo em ${summaryPath}`);
  } finally {
    serverProc.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
