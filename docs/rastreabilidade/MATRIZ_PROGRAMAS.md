# Matriz de rastreabilidade — programas CNC

Atualizada em 14/10/2026. Liga cada programa recebido ao arquivo original, ao que ele comprova, à operação/etapa cadastrada e à fonte desse vínculo. Método em `docs/METODO_DE_TRABALHO.md`.

Legenda: **E** extraído do arquivo · **C** confirmado pelo Gustavo · **D** derivado por cálculo · **S** sugestão não aprovada · **P** pendente.

## Lotes recebidos

| Lote | Peça / OS | Arquivos | Origem informada | Onde está | Situação |
|---|---|---|---|---|---|
| L01 — 09/10/2026 | FP 16F H8 12V · OS 10-713 | O001–O008.TAP | `D:\OS 10713\` (inventário `docs/historico-processo/Inventario_Arquivos_Recebidos.csv`) | `data/cnc/originals/` (SHA-256 em `SHA256.json`) | Incorporado ao processo |
| L02 — 14/10/2026 | FP 16F H8 12V · OS 10-713 | O009, O0010, O0011, O0012, O0013 | anexos da conversa, 14/10 | `data/cnc/recebidos/2026-10-14_OS10713_mesmo-setup-O009-O0013/` | Incorporado à 2ª operação (etapas 12–16), mesmo setup (C, Gustavo 14/10); ordem e divergências pendentes |

## L01 — o que cada programa comprova (E)

Valores lidos do texto dos TAPs. Linhas conferidas com `scripts/ficha_programa.py` e com `data/derived/strategy_data.json` (mesmos Z mínimos). Todos usam **G54**. Tempo = cabeçalho do CAM, estimativa.

| Programa | SHA-256 | Data no TAP | Tempo no cabeçalho | Ferramentas (cabeçalho) | Percursos (comentário CAM) | S / F | Compensação de raio | Z mín. programado | Observações de leitura |
|---|---|---|---|---|---|---|---|---|---|
| O001 | 24d9e24d0d46… | 09.10.2026 11:36 | 0 h 9 min 30 s | T1 GIRASSOL Ø100 R6 | FACEAMENTO | 900 / 1000 | não | 0 (l. 24) | M32 na l. 22; profundidade vem do corretor, não do Z |
| O002 | 7184bbe1aae3… | 09.10.2026 22:02 | 0 h 4 min 27 s | T9 TOPO Ø12 | REFERENCIA | 3979 / 1910 | não | −0,297 | |
| O003 | b013f402a058… | 09.10.2026 22:02 | 2 h 22 min 21 s | T3 ALTO AVANÇO Ø32 R3 | DESBASTE | 1800 / 5400 | não | −99,97 | Z abaixo da espessura 95,75 (passante sobre calços) |
| O004 | 6f46e2c50a13… | 09.10.2026 22:02 | 0 h 30 min 6 s | T12 ABACAXI Ø25 R0.8 · T4 TURBO Ø16 R1 | ALIVIO D25MM (T12); ALIVIO 1, ALIVIO 2 (T4) | T12 2000/800 · T4 1600/800 | não (G40) | T12 −98 (G81) · T4 −97 | Nome diz R0.8; coluna de raio da tabela diz 0 |
| O005 | 921260bb2c6a… | 09.10.2026 22:02 | 0 h 59 min 52 s | T8 TOPO Ø25 LONGA | ACABAMENTO 0,3 / 0,1 / 0,0 G41 | 800 / 400 | G41 (36×) | −96,497 | Passes 0,3 → 0,1 → 0,0 no próprio TAP |
| O006 | 18b108dee4f5… | 09.10.2026 22:02 | 0 h 7 min 53 s | T5 TOPO Ø12 LONGA | CANTO 1 R6 L1 | 1200 / 400 | não | −60 (G81) | |
| O007 | f0ba11efbd52… | 09.10.2026 22:02 | 1 h 5 min 0 s | T5 TOPO Ø12 LONGA · T6 TOPO Ø10 LONGA | CANTO 2 R6 L1 (T5); CANTO R5 L1, RAIO 0,2/0,1/0,0 G41 (T6) | 1200 / 400 | G41 (360×) | T5 −60 · T6 −50 | |
| O008 | f8331162870b… | 09.10.2026 22:02 | 0 h 9 min 42 s | T4 TURBO Ø16 R1 | ESPACADOR | 1600 / 600 | não | −72,421 | |

## L01 — vínculo com o processo

| Programa | Operação → etapa (`data/process.json`) | Fonte do vínculo | Ferramenta na etapa | Montagem / referência | Desenho (folha/região) | Pendências |
|---|---|---|---|---|---|---|
| O001 | 1ª op → Face A (fase 0) e Face B (fase 2) | C — mesmo programa nas duas faces, rodadas 10–13/10 | T1 | Mesa; Z0 topo; orientação invertida na Face A (C, 10/10) | P | corte útil e cabeçote T1 (P) |
| O002 | 2ª op → Marcação e referência (fase 4) | C — ordem 1→8 obrigatória (13/10) | T9 | 4 calços; X0/Y0 centro, Z0 topo (C) | P | posição física dos calços (P) |
| O003 | 2ª op → Desbaste (fase 5) | C | T3 | idem | P | corte útil T3 (P); vida do insert por cavidade (opcional) |
| O004 | 2ª op → Alívios T12 e T4, uma etapa (fase 6) | C — O004 único com T12/T4 | T12, T4 | idem | P | raio T12 (nome × tabela) a confirmar (P) |
| O005 | 2ª op → Acabamento (fase 8) | C | T8 | idem | P | proposta in-process de calibração (S, segue proposta) |
| O006 | 2ª op → Cantos Ø12 (fase 9) | C | T5 | idem | P | |
| O007 | 2ª op → Cantos Ø10 / raios (fase 10) | C | T5, T6 | idem | P | proposta in-process de T6 (S, segue proposta) |
| O008 | 2ª op → Espaçador (fase 11) | C | T4 | idem | P | |

Derivados usados na interface (D): tempo de usinagem = cabeçalho + 20%; montagem recomendada = ceil(descida máxima + 10 mm) por ferramenta (ex.: T3 99,97 → 110 mm); passes de faceamento = ceil(sobremetal da face / 0,7). Nenhum é tempo real nem medida física.

## L02 — o que cada programa comprova (E)

Programas de 13.10.2026 (cabeçalho). Todos em **G54**, Z0 topo. Fichas completas no lote.

| Programa | SHA-256 | Tempo no cabeçalho | Ferramenta (cabeçalho) | Percursos | S / F | Ciclos | Z mín. | Observações de leitura |
|---|---|---|---|---|---|---|---|---|
| O009 | 2d61821acfe8… | 0 h 20 min 58 s | T12 ABACAXI Ø25 R0.8 | REBAIXO 1 L1; REBAIXO 2 L1 | 2546 / 1528 | — | −6,347 (passos de 0,794) | **`GG53`** nas linhas 10, 16 e 5715; R0.8 no nome × 0 na tabela |
| O0010 | 86b1fd0b7031… | 0 h 0 min 5 s | T11 BROCA DE CENTRO Ø5 | GRAVACAO | 8000 / 500 | — | −6,35 | Trajetória forma "OS" e "10713" em X 482–520, Y 210–232 (leitura da trajetória, D) |
| O0011 | a8b3b723f1f0… | 0 h 4 min 57 s | T22 BROCA MD Ø13,5 | FUROS DE CENTRO; FUROS P/ ROSCA 5/8-11 UNC | 1650 / 165 | G81 Z−0,5; G83 Q2 Z−46 | −46 | 10 furos: X ±488,95, ±244,475, 0 · Y ±265,112 |
| O0012 | daaef872c2f3… | 0 h 1 min 23 s | T14 ESCARIADOR 45G Ø56 | ESCARIADOR | 500 / 70 | G81 Z−6 | −6 | Mesmos 10 furos |
| O0013 | 5bfb590abf84… | 0 h 5 min 3 s | T13 MACHO 5/8-11UNC Ø13,8 | ROSCA 5/8-11 UNC | 185 / 2,309 mm/rot (G95) | G84 Z−10 | −10 | M01 antes de roscar; 2,309 = 25,4/11 (passo da UNC, D) |

## L02 — vínculo e divergências

| Programa | Operação → etapa (`data/process.json`) | Fonte | Desenho | Divergência ou dúvida (valores e fontes) |
|---|---|---|---|---|
| O009 | 2ª op → fase 12 | C operação (Gustavo 14/10); ordem P | p.2 Rebaixo Inf. 6,4 ↔ Z −6,347 (≈ 1/4") | `GG53` pode gerar alarme no comando |
| O0010 | 2ª op → fase 13 | C / ordem P | não encontrada no texto do desenho | Gravação em Z −6,35 cai no fundo do rebaixo do O009 (Z −6,347): ~0,003 mm de profundidade |
| O0011 | 2ª op → fase 14 | C / ordem P | p.2 Seção M-M (furos), passo 244,5 ↔ 244,475 | Broca a Z −46 para rosca ↧39 (coerente) |
| O0012 | 2ª op → fase 15 | C / ordem P | p.2 ⌵ Ø15,5 ↧1 × 90° | Com ponta teórica em Z −6, cone de 90° marca Ø12, menor que o furo Ø13,5. Depende do preset de T14 |
| O0013 | 2ª op → fase 16 | C / ordem P | p.2 5/8 UNC ↧39 | **Rosca até Z −10 no TAP × ↧39 no desenho** |

Ordem proposta O009 → O0010 → O0011 → O0012 → O0013 (S): segue os nomes e também a lógica de usinagem (rebaixo antes da gravação no fundo dele; centro → broca → escareador → macho). Não foi informada pelo Gustavo.

Leitura de face (H): a folha 2 do desenho se chama "Usinagem grid inferior" e traz o rebaixo e os furos que estes programas fazem, com Z0 no topo do mesmo setup. Isso sugere que a face voltada para cima na 2ª operação corresponde ao lado "inferior" do desenho e que o Rebaixo Superior 9,5 (folha 1, ainda sem programa) fica para a 3ª operação. Hipótese, não confirmada.

## Operações sem programa

| Operação | Situação |
|---|---|
| 3ª operação | Em levantamento. Sem programas, ferramentas ou montagem. Não definir por suposição. |
| Tratamento térmico | Externo, depois da 3ª operação (C 13/10). |
| Retorno pós-TT | Em levantamento (C 13/10). |

## Como incluir um lote novo nesta matriz

1. Seguir `data/cnc/recebidos/README.md` (original intocado + `LOTE.json` + fichas).
2. Copiar para cá uma linha por programa na tabela "o que comprova", a partir de `fichas/resumo.md` e das fichas.
3. Na tabela de vínculo, só preencher operação/etapa com fonte. Sem fonte: **P**, com a dúvida anotada em `docs/informacoes-a-confirmar.md`.
4. Atenção a nomes repetidos: TAPs de outra peça ou OS podem se chamar O001, O002… O lote, o SHA-256 e a peça identificam o programa, não o nome do arquivo.
