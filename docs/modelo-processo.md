# Como o processo está modelado

Guia curto para quem vai continuar o produto (programador, processista ou engenheiro da Columbia).

## A ideia

A tela é a **jornada da peça**, não um questionário. Cada tela responde só: o que vou fazer, como a peça fica montada, qual programa, qual ferramenta, quanto retirar, quantos passes, quanto tempo e o que vem depois. A interface interpreta `data/process.json`; nenhum valor de engenharia é escrito no código da tela.

```text
Recebimento → 1ª operação (Face A, Face B) → 2ª operação (O002…O0017) → 3ª operação (O0018…O0021, na mesa) → Tratamento térmico → Retorno pós-TT
```

Retorno pós-TT aparece como "processo em levantamento" (neutro, sem alerta). O tratamento térmico é externo.

## Onde cada coisa vive

| Conceito | Arquivo / chave | Observação |
|---|---|---|
| Peça, OS, desenho | `process.json` → `part`, `drawing` | 95,75 mm antes do T.T.; 95,0 mm depois (desenho p.1) |
| Espessura objetivo | `fixture.face_method.pre_heat_target_mm` = 95,75 | Verdade operacional desta peça. Sem divergência, sem confirmação |
| Recebimento | `receiving` | Medida, objetivo (`target.value_from`), estratégia: Face A apenas limpa (`face_a.default_removal_mm` = 0,20, editável) e Face B fecha a espessura |
| Jornada | `journey.nodes` | `kind`: `receiving`, `operation`, `external`, `placeholder`. `counts` define "x de N etapas" (19 hoje) |
| Operações e etapas | `runtime.operations`, `runtime.phases`, `steps` | IDs históricos preservados (1, 3 e 7 arquivados). Ordem obrigatória O001 → O008, seguida de O009 → O0013 e O0014 → O0017 (14/10); 3ª operação O0018 → O0021 (14/10) |
| Fixação | `fixture` | Calços, garras, alinhamento, orientação |
| Referências | `reference_defaults` + `steps[].references` | X0/Y0 centro, Z0 topo |
| Ferramentas | `data/derived` (descida do TAP) + `tool_mounting` | Descida máxima ≠ montagem recomendada = ceil(descida + margem). Dados físicos ausentes ficam `null`; valores padrão usados para demonstração são marcados como provisórios |
| Tempos | `process_timing` | Usinagem = cabeçalho do TAP + 20% (estimativa). Preparação = `setup_estimate_minutes` (45, provisório). Nada é apresentado como tempo real |
| Vida do insert | `insert_usage.studies` + `app/ferramental/insert_domain.js` | Um único conceito de ciclo por aresta (virada/troca a virada/troca). Faceamento O001/T1 conta passes (calcula mm removidos pela redução por passe); O003/T3 conta cavidades. Registro opcional, nunca bloqueia |
| Propostas in-process | `inprocess_proposals` | O005 e O007 continuam como **propostas**; os TAPs não são alterados |

Não há perguntas de descoberta, controles ou inspeção formal na V1. Perguntas ao responsável do projeto ficam em `docs/informacoes-a-confirmar.md`, fora da interface.

## Regras do domínio (`app/journey/journey_domain.js`)

- `stockFor(recebida, objetivo, faceA)` → sobremetal total = recebida − objetivo; Face B = total − Face A; `symmetricMm` só como opção secundária ("Dividir igualmente").
- Exemplo: 111,00 − 95,75 = 15,25 mm; Face A 0,20 → Face B 15,05 mm.
- `progress()` conta recebimento + 18 etapas de programa. `nodeStates()`: done, running, active, waiting, later.
- `nextPhase()` segue a ordem; uma etapa só inicia depois das anteriores (a ação principal leva à etapa pendente).
- `passport()` monta o registro da peça só com registros locais.
- "Como fazer" acrescenta "Presetar Tn no topo da peça" na primeira vez que cada ferramenta aparece em uma operação (`toolsToPreset` em `app/operator_layer.js`, a partir das ferramentas dos programas); ferramenta repetida na mesma operação não pede preset de novo. Ponto zero só na primeira etapa de cada operação.
- Ferramentas do trabalho: a tabela segue a ordem de uso pela frente (da primeira etapa não concluída em diante; `toolPriority` em `app/ferramental/tooling_ui.js`). Com a montagem medida informada, cada linha compara com a montagem recomendada de cada programa que falta (`mountAdvice`): abaixo do primeiro que não alcança, "Puxar X mm para fora antes do O…"; acima da maior necessária por mais que a margem, "Pode encurtar até …"; senão "Atende até o …". Sem medida, nada é sugerido.

## Vida do insert

Cada ciclo fechado guarda, sem digitação do operador: operação, programa, etapa, ferramenta, tipo (`pass` ou `cavity`), quantidade, redução por passe e material removido (passes), evento final (`turn`/`replace`) e data/hora. Registro em um clique no painel da etapa (+ Registrar passe / + Registrar cavidade; Virar insert; Trocar insert; Desfazer). Histórico, média por aresta, ajuste de quantidade e exportação CSV ficam na aba **Vida do insert** abaixo do 3D. Ciclos antigos do T3 (campo `cavities`) continuam válidos.

## Ação principal (uma por estado)

| Estado | Ação |
|---|---|
| Recebimento sem registro | Concluir recebimento |
| Não iniciada | Iniciar operação |
| Em andamento | Concluir operação |
| Concluída | Ir para próxima etapa |

Navegar, abrir detalhes e Play percurso **não** gravam execução.

## Registros (localStorage, chave `columbia-os10713-demo-v2`)

- `state.journey.receiving`: `receivedMm`, `recordedAt`, `faceAMm` (null = valor inicial do cadastro).
- `state.faceTiming.stockByStage` acompanha o recebimento automaticamente (Face A / Face B) para os passes e o tempo.
- `state.operator[fase]`: `started`, `completed`, `startedAt`/`completedAt`, `note`.
- Registros antigos de controle/objetivo são ignorados na leitura, sem apagar o resto.

## Como estender

- **Nova etapa ou programa:** acrescentar em `steps` e `runtime.phases` com ID novo (nunca renumerar) e incluir em `runtime.operations[n].phases`; o contrato (`scripts/project_contract.py`) valida.
- **Definir o retorno pós-TT:** cadastrar programas/etapas e passar o nó para `kind: operation`, `counts: true`.
- **Login por funcionário:** previsto para depois; hoje os registros são locais e anônimos.
- **Aparência:** `design/tokens.json` (fonte única) e `app/journey/journey.css`.

## Arquivos da camada de jornada

- `app/journey/journey_domain.js` — regras puras (`tests/unit/test_journey_domain.cjs`).
- `app/journey/journey_ui.js` — cabeçalho da OS, mapa, recebimento, painel da etapa, "Como fazer", 3D contextual, registro da peça.
- `tests/browser/verify_journey.cjs` — jornada completa em 5 larguras.
