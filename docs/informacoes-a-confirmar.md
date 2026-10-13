# Informações industriais ainda não confirmadas

Lista gerada de `data/process.json` → `open_questions`. A interface mostra cada item como **Informação a confirmar**; nenhuma resposta foi presumida. Ao responder, grave o dado na chave indicada em *Fonte* e retire a pergunta do cadastro.

| # | Pergunta | Contexto | Afeta | Fonte |
|---|---|---|---|---|
| 1 | Qual é a espessura correta antes do tratamento térmico: 96,0 mm (processo) ou 95,75 mm (desenho, página 1)? | O processo informa 96,0 mm; o desenho original indica 95,75 mm antes do T.T. e 95,0 mm depois. | Recebimento, 1ª operação, Controle | `engineering_review` |
| 2 | O sobremetal é dividido igualmente entre as duas faces, ou a Face A apenas limpa e a Face B fecha a medida? | O método registrado hoje é: Face A até limpar, Face B fecha a espessura. A divisão simétrica aparece só como referência visual. | Recebimento, 1ª operação | `fixture.face_method` |
| 3 | Qual é a tolerância de espessura após a primeira operação? | Nenhuma tolerância de espessura foi cadastrada para a 1ª operação. | Controle | `steps[2].inspection` |
| 4 | Qual inspeção libera a segunda operação (instrumento, pontos de medição, quem libera)? | O controle após o faceamento registra a medida, mas o critério de liberação não foi definido. | Controle, 2ª operação | `journey.nodes.control-op1.criteria` |
| 5 | Qual inspeção libera a peça após a segunda operação? | Não há critério de inspeção final cadastrado para a 2ª operação. | Controle | `journey.nodes.control-op2.criteria` |
| 6 | Qual é o critério de inspeção de cada programa da 2ª operação (O002, O003, O004, O006, O008)? | Esses programas não têm inspeção cadastrada; O005 e O007 têm apenas proposta in-process. | 2ª operação | `steps[].inspection` |
| 7 | Quais programas possuem tempo real conhecido? | Os tempos exibidos vêm do cabeçalho do TAP com margem de 20%. Nenhum tempo real foi registrado. | 1ª operação, 2ª operação | `process_timing` |
| 8 | Qual é o tempo de preparação (montagem, fixação, referência) de cada operação? | Tempo de preparação não informado em nenhuma etapa. | 1ª operação, 2ª operação | `steps[].timing.setup_minutes` |
| 9 | Existe ordem obrigatória entre os programas O002 a O008, ou algum pode ser trocado? | A sequência atual segue a numeração recebida. | 2ª operação | `runtime.operations[1].phases` |
| 10 | Quando ocorre o tratamento térmico (após a 1ª operação, após a 2ª, ou em outro ponto) e quem libera o retorno? | O desenho cita espessuras antes e depois do T.T.; a posição do tratamento na sequência não foi informada. | Tratamento | `drawing.thickness_mm` |
| 11 | Qual é a definição da terceira operação (programas, montagem, ferramentas)? | Nenhum programa ou montagem recebido para a 3ª operação. | 3ª operação | `operation_groups[2]` |
| 12 | Qual folha e região do desenho correspondem a cada etapa? | Nenhuma etapa tem página ou região do desenho cadastrada. | 1ª operação, 2ª operação | `steps[].drawing_reference` |
| 13 | Quais revisões de processo, desenho e programas estão aprovadas? | Revisões não informadas no cadastro. | Recebimento, 1ª operação, 2ª operação | `revision / drawing.revision / steps[].program_revision` |
| 14 | Qual é o corte útil real de T1, T3, T12, T4, T8, T5 e T6? | Somente T9 tem corte útil informado (30 mm). | 1ª operação, 2ª operação | `tool_mounting.tools[].cutting_length_mm` |
| 15 | As propostas in-process de O005 e O007 (parada e calibração em uma cavidade) serão adotadas? | As propostas estão cadastradas como sugestão do operador; o TAP não foi alterado. | 2ª operação | `inprocess_proposals` |
| 16 | Os calços e garras ilustrados foram validados fisicamente (posição, altura, folga para a ferramenta)? | A montagem 3D é ilustrativa; não há verificação de colisão. | 1ª operação, 2ª operação | `fixture.physical_collision_validation` |

Também continuam sinalizados na tela: divergência 96,0 × 95,75 mm (aviso de engenharia), validação física de calços/garras, ausência de colisão certificada no 3D e cadastro físico da Mini Portal (`data/machines.json`, campos `null`).
