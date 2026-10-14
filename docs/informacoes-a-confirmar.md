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

## Já decidido (14/10/2026)

| Tema | Decisão | Onde está |
|---|---|---|
| Método de trabalho | Gustavo traz conhecimento e direção; Claude organiza, analisa, implementa e valida. Não inventar dados de engenharia | `docs/METODO_DE_TRABALHO.md` |
| 95,75 mm | Vale só para esta peça (OS 10-713); não generalizar para outras | — |
| Estratégia de sobremetal | Depende do caso (limpar uma face e fechar na outra, ou dividir). O padrão desta peça continua Face A limpa / Face B fecha | `receiving.stock_rule` |
| Medições na produção | Opcionais; nunca bloqueiam o fluxo | — |
| Programas novos | Vínculo com operação só com evidência; numeração do arquivo não prova sequência | `docs/rastreabilidade/MATRIZ_PROGRAMAS.md` |
| O0014–O0017 | Operação com as garras por dentro da peça, ainda no alto, sobre os calços (Gustavo, 05:18) | `docs/rastreabilidade/MATRIZ_PROGRAMAS.md` |
| Depois de O0017 | Tirar a peça, tombar, rebarbar bem a parte de baixo, retirar os calços, limpar a mesa e montar a peça direto na mesa com as mesmas 4 garras por fora; nesta peça alinhar e zerar por fora. Depois as garras voltam para dentro, trocando uma de cada vez (tira uma de fora, põe uma dentro) | — |
| Organização das operações | O0014–O0017 ficam no fim da 2ª operação (troca de garras, ainda nos calços). O setup na mesa, depois do tombo, é a 3ª operação (Gustavo, 14/10 12:25) | `data/process.json` (2ª e 3ª op) |
| 3ª operação | O0018 → O0021 rodam na mesa, nessa ordem. "Ouvinte um" = orelha 1 (O0020): antes dela as garras voltam para dentro, uma de cada vez (Gustavo, 14/10 12:28) | `data/process.json` fases 21–24 |
| Garras por dentro (3D) | Barra com rasgo, parafuso e porca (foto IMG_9422), no meio da peça, onde a ferramenta não desce; posições derivadas dos percursos (Gustavo, 14/10 13:41–13:43). Na 2ª operação as garras passam para dentro a partir do O009, porque O009–O0013 passam sobre as garras de cima (Gustavo, 14:06; conferido nos percursos) | `fixture.inner_clamps` |
| Ponto zero | Referência X0/Y0/Z0 só na primeira etapa de cada operação (O001, O002, O0018); as demais seguem a sequência (Gustavo, 14/10 14:07) | `journey_ui.js` |

## Ainda a levantar

1. Tempos de preparação e medidas físicas da 3ª operação (como nas demais).
2. Programas e setup do retorno pós-TT.
3. Cadastro real das ferramentas (corte útil de T1, T3, T12, T4, T8, T5, T6; cabeçote e fresas).
4. Tempos reais de usinagem e de preparação, quando forem medidos.
5. Regra de inspeção dimensional, se e quando for reintroduzida (instrumento, pontos, tolerância).
6. Folha e região do desenho para cada etapa.
7. Revisões aprovadas de processo, desenho e programas.
8. Validação física de calços e garras (posição, altura, folga).
9. Cadastro físico da Mini Portal (`data/machines.json`, campos `null`).
10. O009–O0013 (14/10): a ordem de execução é O009 → O0010 → O0011 → O0012 → O0013, logo depois do O008?
11. O004/T12: o nome no cabeçalho diz "ABACAXI D25MM R0.8", mas a coluna de raio da mesma tabela diz 0 (O004.TAP, linha 8). Qual vale para a ferramenta real? Impacto: apenas cadastro/visual da ferramenta; o percurso não muda.
12. O0013 rosca 5/8-11 UNC até Z −10, mas o desenho (p.2) pede ↧39 e a broca do O0011 vai a Z −46. Qual profundidade vale? Impacto: rosca 29 mm mais curta que o desenho.
13. O0010 grava "OS 10713" em Z −6,35, sobre o fundo do rebaixo do O009 (Z −6,347). A gravação fica com ~0,003 mm. É intencional?
14. O009 tem blocos `GG53` (linhas 10, 16, 5715). O comando da Mini Portal aceita?
15. O0012 escareador: desenho pede Ø15,5 × 90°; em Z −6 um cone de 90° com ponta teórica marca Ø12. Como T14 é presetado (ponta ou diâmetro de referência)?
16. A face para cima na 2ª operação é o lado "Grid inferior" do desenho (p.2)? Se sim, o Rebaixo Superior 9,5 (p.1) é da 3ª operação?
17. O0014–O0021: O0014–O0017 confirmados no fim da 2ª operação; o setup na mesa é a 3ª operação (14/10 12:25). O0018 → O0021 na mesa confirmados (14/10 12:28). Leitura dos TAPs: O0016 é L1; O0019, O0020 e O0021 são L2; O0014, O0015, O0017 e O0018 não dizem o lado.
18. L1/L2 nos comentários do CAM significam lado 1 (2ª operação) e lado 2 (peça tombada, 3ª operação)?
19. O0015 (externo X) desce até Z −89,973 e O0017 acaba o externo X só até Z −54,997, enquanto o externo Y vai a −98,97 (O0014) e −86,997 (O0017). As alturas diferentes por eixo são intencionais (abas/orelhas)?
20. ~~"Ouvinte um" = orelha 1?~~ Respondido em 14/10 12:28: é a orelha 1 do O0020; as garras voltam para dentro antes dela.

