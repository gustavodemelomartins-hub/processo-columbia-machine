# Qualidade

O que cada check prova e quando rodar. Execute tudo da raiz do repositório.

## Comandos

| Comando | O que prova | Tempo | Quando |
|---|---|---|---|
| `npm run build` | `data/process.json`, derivados, assets e `app/` geram um `index.html` válido (o contrato interrompe o build antes de gravar) | ~1 s | Depois de editar cadastro, app ou design |
| `npm run lint` | ESLint no JavaScript de `app/`, `scripts/` e `tests/`: erros de sintaxe e de lógica comuns (chave duplicada, variável inexistente nos domínios, código inalcançável) | ~1 s | Junto do check |
| `npm run check` | Lint, contrato do cadastro (`scripts/test_project.py`), SHA-256 dos 21 TAPs, PDF e 7 fotos, parser, garras internas fora dos percursos e 7 suítes de domínio/armazenamento | ~5 s | Antes de qualquer commit |
| `npm test` | As mesmas suítes de domínio mais 7 suítes de navegador (jornada completa em 5 larguras, faceamento, status, fluxo simples, in-process, estudo de progresso, ferramentas) com capturas em `artifacts/` | ~10 min | Antes de publicar e depois de mudança de interface |
| `node tests/browser/verify_http.cjs` | Site servido: URLs relativas, PDF, WebGL e larguras 320–1920 (precisa de `COLUMBIA_LIVE_URL` e do servidor iniciado) | não medido | Antes e depois de publicar |

A CI (`.github/workflows/quality.yml`) roda `npm run build`, `npm run check` e confere que o `index.html` versionado é o mesmo do build. As suítes de navegador não rodam na CI; continuam obrigatórias localmente antes do push em `main`.

Não há verificação de tipos (o projeto é JavaScript sem TypeScript) nem lint de Python.

## Lint: medição e regras

Configuração em `eslint.config.mjs`: `@eslint/js` recomendado, globais de navegador em `app/` e de Node em `scripts/` e `tests/`.

Medição de 15/10/2026, antes de ajustar: 1.297 ocorrências, 1.270 delas `no-undef`. Os fragmentos de interface de `app/` são concatenados pelo build num único escopo global do HTML; o lint por arquivo não enxerga variáveis de outro fragmento. Por isso `no-undef` e `no-unused-vars` valem só para os domínios autocontidos (`app/**/*_domain.js`, `app/storage.js`) e para `scripts/` e `tests/unit`. Nos testes de navegador, `no-undef` fica desligado porque os corpos de `page.evaluate` rodam na página.

Legado que avisa (5 avisos em 15/10/2026). Avisos aparecem no check sem reprová-lo; erros reprovam. Quando uma regra de aviso chegar a zero, promova-a para erro em `eslint.config.mjs`.

| Regra | Onde | Situação |
|---|---|---|
| `max-lines` (350, sem linhas em branco/comentários) | `app/operator_layer.js` (357) | Refatorar por responsabilidade numa rodada própria, com testes antes/depois |
| `no-setter-return` | `app/ferramental/tooling_domain.js:25` | Inofensivo (setter de arrow function); trocar por bloco `{}` quando o arquivo for editado |
| `no-unreachable` | `app/job_timing_ui.js:21` | Controle de faceamento desligado de propósito com `return`; remover o código morto ou religar por decisão do Gustavo |
| `no-unused-vars` | `tests/browser/verify_inprocess.cjs:14`, `verify_journey.cjs:81` | Campo nomeado na tupla do caso de teste |

As regras sem violação no legado entram como erro. Não use `eslint-disable` amplo nem rebaixe uma regra para passar o check.

## Estratégia de testes

- Regras de engenharia e de domínio têm teste unitário em `tests/unit`, com os exemplos numéricos do Gustavo como casos (por exemplo, 111,00 − 95,75 = 15,25 mm).
- Fluxos do operador têm teste de navegador em `tests/browser`, nas larguras de desktop, tablet e celular.
- Correção de bug: reproduzir num teste que falha, corrigir e manter o teste.
- Dados de teste (fotos, medidas) ficam só nos testes; nunca entram no `index.html` publicado.

## Ambiente de nuvem

Na sessão do Claude Code na nuvem, o Playwright do projeto não encontra o navegador próprio. Use o Chromium do ambiente:

```sh
COLUMBIA_CHROMIUM_PATH=/opt/pw-browsers/chromium npm test
```

No computador do Gustavo, `npx playwright install chromium` instala o navegador da versão travada no `package-lock.json`.

## Dependências

Em 15/10/2026: `npm audit` e `npm audit --omit=dev` sem vulnerabilidades; Pillow 12.3.0 é a versão atual. Playwright está em 1.62.1 (1.64.1 disponível): atualizar exige baixar outro navegador nas máquinas e reexecutar as suítes, então fica para uma rodada própria.

## Revisão após implementação ou correção

Ao fim de cada ciclo de implementação ou correção, sugerir de 3 a 8 ciclos de code review, com quantidade proporcional ao risco, focos complementares (comportamento, regressões e testes, dados industriais, interface e acessibilidade, desempenho) e um prompt pronto com os comandos acima. É convenção do projeto, não garantia; uma rodada só acontece quando o Gustavo pedir. Cada ciclo revisa o estado atual, registra achados com severidade, local e evidência, e reavalia correções com os checks afetados.

## Manutenção

Atualize este documento junto de scripts, regras de lint e suítes que mudarem.
