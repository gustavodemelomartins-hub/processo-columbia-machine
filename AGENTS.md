# Processo Columbia Machine — instruções para agentes

Protótipo estático de padronização do processo da OS 10-713 (FP 16F H8 12V) na Mini Portal, publicado no GitHub Pages a partir de `main`. Produto e escopo: [PRODUCT.md](PRODUCT.md). Como o Gustavo e o Claude trabalham: [docs/METODO_DE_TRABALHO.md](docs/METODO_DE_TRABALHO.md). Este arquivo vale para qualquer cliente (Claude Code importa por `CLAUDE.md`); regras novas do projeto entram aqui.

## Stack e comandos

HTML/CSS/JavaScript sem framework (Three.js e gviewer em `vendor/`), Python 3.11+ (Pillow) para build/parser, Node.js 22.13+ com npm e Playwright para testes. Execute da raiz.

- Instalar: `python -m pip install -r requirements.txt` e `npm ci` (navegador local: `npx playwright install chromium`).
- Desenvolver: `npm run build` e `npm run dev` (http://127.0.0.1:4173/).
- Lint: `npm run lint` (ESLint; legado medido avisa, erro novo falha).
- Verificar base: `npm run check` (lint, contrato, hash dos originais, parser, garras internas, domínios). Roda em segundos.
- Testes completos: `npm test` (domínios + 7 suítes de navegador, ~10 min). Na nuvem, use `COLUMBIA_CHROMIUM_PATH=/opt/pw-browsers/chromium npm test`.
- Build: `npm run build` (gera `index.html`; a CI confere que ele está atualizado).
- Tipos: indisponível (JavaScript sem TypeScript). O que cada check prova: [docs/quality.md](docs/quality.md).

## Mapa

- `data/process.json`: cadastro, fonte única do processo. `data/cnc/originals/`: TAPs imutáveis (hash conferido). `data/derived/`: extraído dos TAPs.
- `app/`: interface e domínios (regras puras em `*_domain.js`). `design/tokens.json`: fonte única do visual.
- `scripts/`: build, parser, contrato e checks. `tests/unit`, `tests/browser`: testes. `index.html`: gerado, nunca editar.
- Estrutura e fronteiras: [docs/arquitetura.md](docs/arquitetura.md). Modelo do processo: [docs/modelo-processo.md](docs/modelo-processo.md). Visual: [docs/design-system.md](docs/design-system.md). Programas recebidos: [docs/rastreabilidade/MATRIZ_PROGRAMAS.md](docs/rastreabilidade/MATRIZ_PROGRAMAS.md). Decisões e perguntas: [docs/informacoes-a-confirmar.md](docs/informacoes-a-confirmar.md). Setup das ferramentas de IA: [docs/setup.md](docs/setup.md).

## Regras do domínio (não mudar sem decisão do Gustavo)

- Pasta oficial: `software` dentro de Processo Columbia Machine. Não reconstruir o aplicativo nem editar o HTML de saída.
- Preservar um caso real na Mini Portal: duas faces O001; sete etapas O002–O008 mais O009–O0013 no mesmo setup e O0014–O0017 com garras por dentro (14/10); 3ª operação na mesa O0018–O0021 (14/10); O004 único com T12/T4. Ordem O001→O008 obrigatória.
- Programas novos entram por `data/cnc/recebidos` (ver docs/METODO_DE_TRABALHO.md). Nunca mapear programa a operação por suposição ou pela numeração do arquivo.
- IDs persistidos e chave `columbia-os10713-demo-v2` não mudam sem migração. Play/navegação não registram execução.
- Manter campos Descida máxima no programa / Montagem recomendada separados; dados físicos desconhecidos `null`. Montagem recomendada ceil(descida+margem), padrão 10; T1 limite operacional 1 separado de Z nominal 0; corretor Mini Portal (real−nominal)/2, ação explícita.
- Faceamento por sobremetal e ceil/0,7 editável; sem medida, tempo "A definir"; margem de tempo 20%. Preparação ~45 min e tempos do TAP são estimativas, nunca tempo real.
- Espessura antes do T.T. = 95,75 mm (decisão do responsável em 13/10/2026, só para esta peça); não reintroduzir 96,0 nem alerta de divergência. Sobremetal: Face A apenas limpa (0,20 editável) e Face B fecha.
- Jornada: Recebimento → 1ª → 2ª → 3ª → Tratamento térmico → Retorno pós-TT (`data/process.json` → receiving, journey). Retorno pós-TT em levantamento (neutro, sem pendência).
- Princípio da V1: o operador não alimenta ERP nem responde questionário. Nada de perguntas de descoberta, Controle, inspeção formal, confirmação de responsável ou estados "a confirmar" na tela; perguntas vão para docs/informacoes-a-confirmar.md. Não recolocar checklist antigo de preparação.
- Uma única ação principal por estado (Iniciar operação → Concluir operação → Ir para próxima etapa).
- Propostas O005/O007 continuam propostas. Coluna direita do 3D só com "Como fazer"; técnica em abas abaixo do 3D.
- Vida do insert = um único domínio de ciclo por aresta (passes no O001/T1, cavidades no O003/T3), um clique, opcional, nunca bloqueia.
- Visual: fonte do sistema (Segoe UI), rótulos em caixa normal, sem mono na interface.
- Nenhuma rede, autenticação, conexão CNC ou múltiplas máquinas na V1. Perfis antigos ficam isolados. Renderer, TAPs, parser, desenho e registros existentes preservados. Não preencher fotos/medidas de testes na entrega.

## Acordos de trabalho

- Ler instruções e código pertinentes antes de agir. Separar extraído, confirmado, derivado, sugestão e pendente; nunca inventar dados de engenharia nem corrigir em silêncio.
- Rodadas pequenas, sem reconstruir nem acrescentar burocracia. Menor mudança completa; reutilizar o que existe.
- Definir aceite e comando antes de implementar. Correção de bug tem reprodução e teste de regressão quando viável.
- Depois de editar: `npm run build`, `npm run check`, `npm test`; conferir 3D, desenho, mobile, hash dos originais e fontes de L/N.
- Atualizar o documento responsável junto da mudança (cadastro, comandos, fronteiras, visual). Regra que falhar de novo vira teste ou check, não mais texto.
- Publicar só no Pages existente, por push fast-forward em `main`, depois dos testes e com autorização do Gustavo. Publicação, mensagens a terceiros, custos e ações destrutivas dependem de autorização. Instalar ferramenta não autoriza usá-la para publicar.
- Um bloqueio afeta só o que depende dele. Ao retomar, conferir checkout, arquivos e checks reais antes de confiar no resumo anterior.

## Ferramentas de IA

Configuradas por projeto em `.claude/settings.json`; estado e pendências em [docs/setup.md](docs/setup.md).

- **Superpowers:** processo proporcional ao pedido. Rodada pequena e execução já autorizada dispensam aprovações repetidas.
- **Ponytail (full):** menor solução completa, sem abstração para necessidade não pedida. `stop ponytail` desativa.
- **Caveman:** conversa concisa em português do Brasil, com frases completas quando ajudam a clareza. Código, documentação e commits com redação normal. `stop caveman` desativa.
- **Context7:** documentação atual de bibliotecas, um conceito por consulta, sem enviar código privado ou dados do processo. Se indisponível, usar documentação oficial e registrar.
- **Chrome DevTools MCP:** console, rede e desempenho do `index.html` servido em localhost; perfil próprio, nunca o navegador pessoal nem produção.
- **web-design-guidelines** (skill local): revisão de UI e acessibilidade antes de concluir mudança visual.
- **Graphify:** grafo só de código (`graphify-out/`, não versionado); confirmar no código o que o grafo sugerir.
- **RTK:** quando instalado com hook, usar comandos normais; `rtk proxy <cmd>` para saída completa.

## Delegação e revisão

- Delegar só quando isolamento de contexto, especialização ou paralelismo independente compensarem. Modelo mais leve para busca, inventário e mudança mecânica; capacidade maior para engenharia, dados e revisão crítica. Preservar o modelo principal e a autenticação.
- Cada tarefa delegada recebe objetivo, arquivos permitidos, aceite e checks; um escritor por arquivo; revisores só leem. O coordenador confere diff e checks antes de aceitar.
- Após cada ciclo de implementação ou correção, sugerir de **3 a 8 ciclos de code review** (quantidade e focos pelo risco), com prompt pronto. É convenção do projeto, não garantia; não dispara revisões sozinha.
- Sem hooks Git, bloqueio de `main` ou exigência de branch/worktree.
