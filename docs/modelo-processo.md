# Como o processo está modelado

Guia curto para quem vai continuar o produto (programador, processista ou engenheiro da Columbia).

## A ideia

A tela não é uma página de informações: é a **jornada da peça**. Uma OS percorre nós em sequência e, em cada etapa de usinagem, um roteiro de oito seções. A interface só interpreta `data/process.json`; nenhum valor de engenharia é escrito no código da tela.

```
Recebimento → 1ª operação (Face A, Face B) → Controle de espessura → Tratamento térmico (?) → 2ª operação (O002…O008) → Controle → 3ª operação (não definida)
```

Cada tela responde: **onde estou** (cabeçalho da OS + mapa da jornada), **o que fazer agora** (linha "Agora" + ação principal), **como fazer** (seção do roteiro) e **o que conferir antes de continuar** (lista à direita).

## Onde cada coisa vive

| Conceito | Arquivo / chave | Observação |
|---|---|---|
| Peça, OS, desenho | `process.json` → `part`, `drawing` | Espessuras do desenho antes/depois do T.T. |
| Recebimento | `receiving` | Rótulo da medida, candidatos de objetivo (`value_from` aponta para o dado de origem), regra de sobremetal, método do processo, referência simétrica (`confirmed: false`) |
| Jornada | `journey.nodes` | `kind`: `receiving`, `operation`, `control`, `external`. `counts` define o que entra em "x de N etapas". Cada nó lista as perguntas em aberto que o afetam |
| Operações e etapas | `runtime.operations`, `runtime.phases`, `steps` | IDs históricos preservados (1, 3 e 7 arquivados). `steps[].intent` dá tipo e objetivo; `steps[].timing.setup_minutes` = `null` (não informado) |
| Roteiro da etapa | `stage_guide.sections` | Preparação, Fixação, Referenciamento, Ferramentas, Programa CNC, Usinagem, Inspeção, Conclusão |
| Fixação | `fixture` | Calços, garras, alinhamento, orientação. `physical_collision_validation: false` |
| Referências | `reference_defaults` + `steps[].references` | X0/Y0 centro, Z0 topo; exceção por etapa |
| Ferramentas | `data/derived` (descida do TAP) + `tool_mounting` (margem, corte útil) | Descida máxima ≠ montagem recomendada = ceil(descida + margem) |
| Tempos | `process_timing` + `data/derived/strategy_data.json` | Cabeçalho do TAP + 20%; faceamento por passes. Tempo real = carimbos manuais |
| Inspeção | `steps[].inspection`, `inprocess_proposals`, `journey.nodes[].criteria` | `criteria: null` aparece como "Critério a confirmar" |
| Pendências | `open_questions` | `id`, pergunta, contexto, nós afetados, fonte. Viram o painel "Informações a confirmar" |

## Regras do domínio (`app/journey/journey_domain.js`)

- `stockFor(recebida, objetivo, apósFaceA)` → sobremetal total; referência simétrica (½ por face, `confirmed:false`); método do processo (Face A = recebida − após A; Face B = após A − objetivo).
- O sistema **nunca escolhe** entre 96,0 (processo) e 95,75 (desenho). Até alguém confirmar, os dois cálculos aparecem lado a lado. A confirmação exige nome e é local; a pendência de engenharia continua aberta.
- `progress()` conta recebimento + etapas ativas das operações definidas + controles (12 hoje). Tratamento térmico e 3ª operação aparecem, mas não contam.
- `nodeStates()` e `overallStatus()` derivam estados (Concluída, Atual, Em execução, Aguardando, A confirmar, Não definida) e o status geral (Aguardando recebimento, Em preparação, Em usinagem, Aguardando inspeção).
- `nextPhase()` destaca a próxima etapa após a conclusão; ao fim de uma operação, aponta o controle.
- `passport()` monta o passaporte da peça só com registros locais.

## Registros (localStorage, chave `columbia-os10713-demo-v2`)

- `state.journey`: `receiving` (espessura, hora, escolha de objetivo com responsável), `controls` (após Face A, medida de cada controle, liberação), `view` (nó aberto).
- `state.operator[fase]`: `started`, `completed`, mais `startedAt`/`completedAt` (carimbos novos, aditivos) e `note`.
- Navegar, trocar seção e Play percurso **não** gravam execução. Só gravam: Registrar recebimento, Confirmar objetivo, Iniciar etapa, Concluir etapa/Concluída, Registrar inspeção e liberar, e os campos de medida.

## Como estender

- **Nova etapa ou programa:** acrescentar em `steps` e `runtime.phases` com ID novo (nunca renumerar), incluir em `runtime.operations[n].phases`; o contrato (`scripts/project_contract.py`) valida.
- **Definir a 3ª operação:** preencher `operation_groups[2]`, `runtime.operations[2]` (status ≠ `pending`) e mudar o nó `op3` para `counts: true`, `defined` removido.
- **Fechar uma pendência:** gravar o dado na chave indicada em `source` da pergunta e remover a pergunta de `open_questions` (e dos `questions` dos nós). Ex.: tolerância → `journey.nodes[control-op1].tolerance_mm`.
- **Mudar a aparência:** editar `design/tokens.json` (fonte única, espelhada no Design System "Columbia Processo") e `app/design/components.css`.

## Arquivos da camada de jornada

- `app/journey/journey_domain.js` — regras puras (testadas em `tests/unit/test_journey_domain.cjs`).
- `app/journey/journey_ui.js` — cabeçalho da OS, mapa, recebimento, controles, roteiro, 3D contextual, passaporte, pendências.
- `app/journey/journey.css`, `app/design/components.css`, `design/tokens.json` (+ `scripts/design_tokens.py`).
- `tests/browser/verify_journey.cjs` — fluxo completo em 5 larguras.
