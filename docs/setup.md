# Setup das ferramentas de IA e evidências

Adoção do [Vibe Coding Toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit) neste projeto existente, pelo prompt 12 (projeto existente). Estados usados: **validado** (executado e observado), **configurado** (no repositório, sem execução observada no computador do Gustavo), **reaproveitado** (equivalente que já existia), **inaplicável** (com motivo) e **bloqueado** (com condição para retomar).

## Origem e contexto

- Data: 15/10/2026. Revisão única do toolkit: `f13bb354363dafef8ce8d8f605856cc9e1cc52cc` (main, 15/10/2026 00:01 −04:00), lida em cópia temporária fora do projeto; todos os guias e templates vieram dela.
- Onde foi executado: sessão do Claude Code na nuvem (container Linux descartável, Claude Code 2.1.300, Node 22.22.0, Python 3.13), numa branch própria a partir de `main` (`a63f712`). Instalações feitas no container não chegam ao computador do Gustavo; só o que está versionado no repositório. O que depende do computador dele está em [Intervenções pendentes](#intervenções-pendentes).
- Rede do container: GitHub, npm e PyPI acessíveis; `mcp.context7.com`, `context7.com` e `eslint.org` bloqueados pela política de rede do ambiente de nuvem. Sem Context7, versões e opções foram conferidas no registry npm (`npm view`: versão estável, `dist-tags`, `engines`), nos repositórios oficiais no GitHub e na ajuda das CLIs instaladas.
- Superpowers não estava carregado na sessão que fez o setup (o plugin foi instalado durante ela). O protocolo de entendimento e desenho foi seguido manualmente; como o Gustavo trabalha de forma assíncrona, a implementação foi feita numa branch local, sem push nem publicação, e apresentada para aprovação antes de sair do container.

## Mapa dos documentos do toolkit

| Destino do manifesto | Neste projeto | Decisão |
|---|---|---|
| `README.md` | `README.md` | Mantido; ganhou a seção Documentação e o comando de lint |
| `PRODUCT.md` | `PRODUCT.md` (novo) | Consolida produto, público, fluxos, fora de escopo e aceite, a partir de README, modelo do processo, backlog e decisões; não havia `product.md` |
| `AGENTS.md` | `AGENTS.md` (novo) | Instruções compartilhadas: comandos, mapa, regras do domínio (vindas do `CLAUDE.md` anterior, sem perda), acordos, ferramentas, delegação e revisão |
| `CLAUDE.md` | `CLAUDE.md` | Agora importa `AGENTS.md` (`@AGENTS.md`) e guarda só o que é do Claude Code. Validado: uma sessão nova carrega o conteúdo uma vez |
| `docs/architecture.md` | `docs/arquitetura.md` + `docs/modelo-processo.md` | Equivalentes canônicos preservados, sem cópia concorrente |
| `docs/design.md` | `docs/design-system.md` + `docs/ux-jornada.md` + `design/tokens.json` | Equivalentes canônicos preservados |
| `docs/onboarding.md` | `README.md` (Rodar) + `docs/METODO_DE_TRABALHO.md` | Equivalentes; dificuldade conhecida da nuvem registrada em `docs/quality.md` |
| `docs/quality.md` | `docs/quality.md` (novo) | Não havia documento de checks |
| `docs/setup.md` | este arquivo (novo) | Evidências do setup |

## Matriz de cobertura do catálogo

| Peça | Necessidade no projeto | Ação | Escopo | Estado e evidência |
|---|---|---|---|---|
| Superpowers 6.4.1 | Processo proporcional nas rodadas | Instalado e habilitado | Projeto (`.claude/settings.json`) | Validado no container: sessão nova lista 14 skills `superpowers:*` e o hook de início injeta `using-superpowers`. No Windows: configurado |
| Ponytail 5.2.0 | Menor mudança completa (combina com as rodadas pequenas) | Instalado e habilitado | Projeto | Validado no container: hook "PONYTAIL MODE ACTIVE — level: full" |
| Caveman 4.0.1 | Conversa concisa em pt-BR | Instalado e habilitado; regra de clareza no `AGENTS.md` | Projeto | Validado no container: hook "CAVEMAN MODE ACTIVE — mode: caveman" (o modo mais leve). As dependências npm do plugin não são instaladas pelo Claude Code (lockfile pnpm); os hooks funcionaram mesmo assim |
| Context7 | APIs atuais de bibliotecas | Plugin oficial habilitado (MCP remoto + skill) | Projeto | Bloqueado na nuvem: MCP falha com `ERR_PROXY_TUNNEL` (host negado pela rede do ambiente). Falta uma consulta real no computador do Gustavo |
| Chrome DevTools MCP 1.9.0 | Console, rede e desempenho do HTML de ~14,6 MB | Plugin oficial habilitado; estatísticas de uso desligadas por `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS=1` em `.claude/settings.json` | Projeto | Validado no container: servidor aberto por stdio com o Chromium do ambiente (`--headless --isolated --no-sandbox`) navegou no `index.html` servido em localhost e leu console e rede; sessão nova mostra o MCP conectado. No Windows usa o Chrome instalado: configurado |
| `web-design-guidelines` (Vercel) | Revisão de UI e acessibilidade para tablet industrial | Instalada com `npx skills@1.7.2 … --agent claude-code --copy` | Projeto (`.claude/skills/`, `skills-lock.json`) | Validado: sessão nova descobre a skill. Cópia em vez de link por causa do Windows. Licença MIT (vercel-labs/agent-skills) |
| Demais skills Vercel (`vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-react-native-skills`) | Nenhuma: não há React/Next/Expo e o site está no GitHub Pages | Inaplicáveis | — | Catálogo conferido em 15/10/2026 (9 skills, mesmos nomes do toolkit) |
| `writing-guidelines` | Revisão de prosa | Não instalada | — | Handbook em inglês; docs e interface são pt-BR e já seguem o `METODO_DE_TRABALHO.md`. Reavaliar se surgir documentação em inglês |
| `find-skills` | Descoberta de capacidades | Não instalada | — | Sem lacuna concreta; o marketplace oficial do Claude Code já cobre a descoberta |
| ESLint 10.12.0 + `@eslint/js` 10.0.1 + `globals` 17.13.0 | Pegar erros de lógica no JavaScript | Perfil leve adaptado em `eslint.config.mjs`; `npm run lint` dentro do `npm run check` (e portanto na CI) | Projeto (devDependencies) | Validado: 0 erros e 5 avisos de legado; arquivos de prova com chave duplicada e variável inexistente geram erro. Medição e exceções em `docs/quality.md` |
| Regras próprias do toolkit (`quality/max-lines`, `no-direct-console`, `no-direct-data-access`) e `verify.mjs` | Logger e camada de dados não existem; tamanho de arquivo é coberto pelo `max-lines` nativo | Não copiadas; `max-lines` nativo (350) em aviso | — | Sem regra própria, não há self-check a copiar |
| Biome | Formatador/lint paralelo | Inaplicável | — | Duplicaria o ESLint; reformatar a base inteira contraria as rodadas pequenas |
| Graphify 0.9.91 | Perguntas de estrutura do código | `.graphifyignore` versionado e `graphify-out/` no `.gitignore`; grafo só de código, sem LLM | CLI: usuário (pendente no Windows) | Validado no container: `graphify extract . --code-only --no-cluster` gerou 387 nós e 715 arestas (app 185, tests 89, scripts 71); `graphify explain` respondeu. Cobertura limitada: os fragmentos de `app/` compartilham escopo global no build, então o grafo mostra poucas ligações entre eles. Extração semântica de documentos não usada |
| RTK | Saída enxuta de comandos | Não instalado | Usuário (global) | Bloqueado: exige instalação e hook globais no computador do Gustavo (comandos abaixo). No container não persistiria |
| agent-browser | Automação de navegador | Reaproveitado equivalente | — | As 7 suítes Playwright em `tests/browser` já automatizam e capturam os fluxos |
| Memória do Claude | Contexto entre sessões | Reaproveitada | — | Memória do projeto no Claude (`MEMORY.md`) + documentos versionados (`METODO_DE_TRABALHO.md`, `informacoes-a-confirmar.md`) |
| Obsidian | Memória externa | Inaplicável | — | Sem necessidade concreta nem vault autorizado |
| Skills oficiais da Anthropic (docx, pdf, xlsx, pptx, skill-creator) | Artefatos e criação de skills | Reaproveitadas | Cliente | Já disponíveis no Claude (claude.ai); não duplicadas no projeto |
| Plugins oficiais extras (code-review, security-review, simplify…) | Revisão | Reaproveitados | Cliente | `code-review`, `security-review` e `simplify` já vêm no Claude Code usado aqui |
| aia-harness | Onboarding de projeto | Não instalado | — | Sobreporia este harness (AGENTS.md, docs e matriz) |
| Hooks próprios | — | Nenhum criado | — | Só os hooks dos plugins oficiais. Sem hooks Git, bloqueio de `main` ou exigência de branch |
| Codex | Outro cliente | `AGENTS.md` serve como instrução | — | Sem `.codex/config.toml`: o Codex não é usado hoje; configuração Claude não foi copiada |
| Templates `next/`, Drizzle, Zod, Pino | — | Inaplicáveis | — | Sem Next, banco, servidor ou logger; o produto não tem persistência remota (V1 sem rede) |
| `templates/project/mcp.json.example` | Context7 por MCP | Não usado | — | Context7 entra pelo plugin, evitando dois servidores para a mesma função |
| `environment-manifest.json.example` e setup da máquina (doc 03, prompt 10) | Ambiente global | Fora do escopo do projeto | — | Intervenções globais listadas abaixo |
| Prompts avulsos 01–11 | Tarefas isoladas | Não executados | — | Próximos candidatos: 09 (refatorar `app/operator_layer.js`) e 03 (code review) |

## Política de delegação

Subagentes são usados quando isolamento de contexto, especialização ou trabalho paralelo independente compensam (regras em `AGENTS.md`). Neste setup nenhum subagente foi despachado: as etapas dependiam umas das outras e eram pequenas. A sessão permite escolher modelo por subagente (Sonnet, Opus ou Haiku); a escolha segue o risco da tarefa, com o modelo principal preservado.

## Verificações

| Item | Antes (15/10, `a63f712`) | Depois | Evidência |
|---|---|---|---|
| `npm run build` | Passou (14.614.847 bytes, 14 ferramentas, 21 TAPs) | Passou, `index.html` idêntico | Saída do build; `git diff index.html` vazio |
| `npm run check` | Passou em ~4 s | Passou, agora com lint | Saída "Todas as verificações selecionadas passaram" |
| `npm test` | Passou em 10 min 17 s com `COLUMBIA_CHROMIUM_PATH=/opt/pw-browsers/chromium` (sem a variável, falha ao abrir o navegador: problema do ambiente, não do projeto) | Passou em 11 min 26 s, com a mesma variável | Log das 7 suítes de navegador |
| `npm run lint` | Não existia | 0 erros, 5 avisos | Saída do ESLint |
| `npm audit` / `--omit=dev` | — | 0 vulnerabilidades | Saída do npm |
| Sessão nova do Claude Code no projeto | — | 5 plugins carregados, skill local descoberta, hooks Superpowers/Ponytail/Caveman ativos, Chrome DevTools conectado, Context7 falhou (rede) | Evento `init` de `claude -p --output-format stream-json` |
| Reexecução | — | Reinstalar plugins e skill não duplicou entradas em `.claude/settings.json` nem em `skills-lock.json` | Diff após repetir os comandos |

Revisão só estática: comportamento dos plugins e do Chrome DevTools no Windows, consulta real ao Context7 e RTK.

## Intervenções pendentes

No computador do Gustavo, depois que esta branch entrar em `main` e for baixada para a pasta `software`:

1. `npm ci` (novas dependências de desenvolvimento) e `node --version` ≥ 22.13 (exigência do ESLint 10).
2. Abrir o Claude Code na pasta e aceitar a confiança na pasta e a instalação dos marketplaces e plugins declarados. Conferir com `/plugin` que aparecem superpowers, ponytail, caveman, context7 e chrome-devtools-mcp, e fazer uma pergunta que use o Context7. Se ele pedir autenticação ou atingir limite: `npx ctx7 setup --claude` (OAuth, configuração do usuário).
3. RTK (global, opcional, precisa da autorização dele): `winget install rtk-ai.rtk`, depois `rtk init -g` (registra o hook no `settings.json` do usuário, com backup) e `rtk gain` para conferir. A edição padrão inclui um motor sob BUSL-1.1; existe a edição só Apache-2.0 (`rtk-oss`).
4. Graphify (opcional): `uv tool install graphifyy` (ou `pipx install graphifyy`), depois, no PowerShell e na raiz do projeto, `$env:GRAPHIFY_NO_AUTO_REFRESH=1; graphify extract . --code-only --no-cluster`. Não rodar `graphify install` com hooks sem decidir antes.
5. Para o Context7 funcionar nas sessões na nuvem: liberar `mcp.context7.com` na rede do ambiente de nuvem (configurações do projeto no Claude).

## Repetir ou manter este setup

1. Obter a revisão atual do toolkit e comparar com a registrada acima; ler o catálogo inteiro (`docs/tools/README.md`, `docs/prompts/README.md`, `templates/README.md`).
2. Plugins: `claude plugin marketplace update` e `claude plugin install <plugin>@<marketplace> --scope project` (não duplica). Skill Vercel: `npx --yes skills@latest update --project --yes` e revisar o diff de `skills-lock.json`.
3. Lint: medir com `npx eslint . -f json` antes de mudar regras; regra nova com legado entra em aviso, sem legado em erro.
4. Rodar `npm run build`, `npm run check` e `npm test` e atualizar este documento com data, revisão e resultados.

Revisar estas decisões quando: o projeto ganhar React/TypeScript ou backend (skills Vercel, typed lint, templates Next); o Codex passar a ser usado (`.codex/config.toml`); o grafo ficar desatualizado em relação ao código; ou um aviso de lint chegar a zero (promover a regra para erro).
