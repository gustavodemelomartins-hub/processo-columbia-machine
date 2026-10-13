# Perguntas para o responsável pelo projeto

Estas perguntas **não aparecem na interface do operador**. Servem para a próxima rodada de levantamento com o responsável pelo projeto, antes de implementar.

## Já decidido (13/10/2026)

| Tema | Decisão | Onde está no cadastro |
|---|---|---|
| Espessura antes do T.T. | 95,75 mm é a verdade operacional desta peça | `fixture.face_method.pre_heat_target_mm` |
| Divisão do sobremetal | Face A apenas limpa (0,20 mm inicial, editável); Face B fecha a espessura. Divisão igual só como opção secundária | `receiving.stock_rule` |
| Inspeção | Sem fluxo formal na V1; os próprios operadores medem, conferem e liberam | — |
| Etapas de Controle | Fora da V1 até existir regra real | `journey.nodes` |
| Tempos de programa | Estimativa do TAP + 20%; não há tempo real registrado | `process_timing` |
| Preparação/setup | ~45 min estimados, provisório | `process_timing.setup_estimate_minutes` |
| Ordem dos programas | Obrigatória: O001 → O002 → … → O008 | `runtime.operations[].phases` |
| Tratamento térmico | Depois da 3ª operação; segue o retorno pós-TT | `journey.nodes` |
| Propostas O005/O007 | Continuam como propostas, para avaliação; TAPs não alterados | `inprocess_proposals` |
| Responsável/login | Sem nome nem aprovação adicional agora; login por funcionário fica para depois | — |

## Ainda a levantar

1. Programas, montagem e ferramentas da 3ª operação.
2. Programas e setup do retorno pós-TT.
3. Cadastro real das ferramentas (corte útil de T1, T3, T12, T4, T8, T5, T6; cabeçote e fresas).
4. Tempos reais de usinagem e de preparação, quando forem medidos.
5. Regra de inspeção dimensional, se e quando for reintroduzida (instrumento, pontos, tolerância).
6. Folha e região do desenho para cada etapa.
7. Revisões aprovadas de processo, desenho e programas.
8. Validação física de calços e garras (posição, altura, folga).
9. Cadastro físico da Mini Portal (`data/machines.json`, campos `null`).
