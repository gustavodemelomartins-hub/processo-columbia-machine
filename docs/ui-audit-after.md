# Auditoria UI depois — Processo Columbia Machine

> Registro da rodada anterior (06c02b2). A disposição atual e a validação dos novos comentários estão em [Refinamentos operacionais](ui-refinements.md).

2026-10-10. Resultado: PASS no escopo desta rodada. Aplicação real inspecionada em Chromium, em 1920×1080 e 1440×900; capturas antes/depois e completas em `screens/`. Monitor físico distante e celular físico não foram testados.

## Antes → depois

| Achado anterior | Resultado | Evidência |
|---|---|---|
| 01 · 3D pequeno | Corrigido | 1920: 1233×620 px, cerca de 66% da região; antes 679×410. 1440: 897×550; antes 502×370. Vista começa em y436, antes y641. |
| 02 · Terceira coluna duplicava programa | Corrigido | Duas regiões: vista e ferramenta/checklist. Estratégias/chamadas/linhas ficam em Detalhes técnicos, fechado. |
| 03 · Oito ferramentas na lateral | Corrigido | O003 mostra T3; O004 mostra T12/T4; O007 mostra T5/T6. Todas as oito na lista inferior. |
| 04 · Passos apertados em duas colunas | Corrigido | Uma coluna numerada 01–09, texto de 21 px, depois da região visual. |
| 05 · Comprimentos misturados | Corrigido | Descida exata 99,97 mm separada da recomendação 110 mm. Medida real fora da pinça em campo próprio. |
| 06 · Alvos pequenos | Melhorado | Checks de 22 px com labels de pelo menos 44 px; Play, navegação de etapa, abas e select com altura ≥44 px. |
| 07 · Identidade/programa/parâmetros repetidos | Corrigido | Programa no cabeçalho; identidade e S/F/WCS na ferramenta; consulta técnica complementar fechada. |
| 08 · Procedência de origem repetida | Melhorado | Uma explicação de engenharia; X/Y e Z e confirmações mantidos em Referência. Passos ainda citam a ação de conferir, intencionalmente. |
| 09 · Texto essencial minúsculo | Melhorado | Etapa 36 px; programa 28 px; T 32 px; parâmetros 23 px; descida 31 px e recomendação 39 px no monitor industrial. Auxiliares 15–16 px. |
| 10 · Containers competindo | Melhorado | Terceira região retirada; painéis principais e divisórias funcionais preservados. |
| 11 · Play abaixo da tela | Corrigido | Play junto às abas, disponível no alto nos dois tamanhos. |
| 12 · Cálculos dispersos | Corrigido | ToolLengthRule.evaluate e mountingRule como adaptador único para painel, lista, confirmação e estimativa 3D. |

12 achados: 8 corrigidos, 4 melhorados, 0 regressões pendentes observadas. Não se afirma conformidade WCAG completa nem legibilidade física validada no posto.

## Revisão visual e correções durante a auditoria

A primeira composição ampliava o 3D, mas ainda deixava Play abaixo da dobra. O controle foi levado ao alto da vista. A navegação de operação saiu da célula de status, reduzindo a altura do cabeçalho. O título duplicado da ferramenta foi retirado. Nova captura e inspeção confirmaram o espaço recuperado.

Foram vistos: telas 1920/1440, passos/referências, tabela das oito ferramentas e O004 com duas ferramentas na lateral. O004 usa rolagem interna para a segunda ferramenta; isso preserva altura/legibilidade. O 3D, instruções e lista inferior usam rolagem vertical intencional. Sem overflow horizontal nos tamanhos principais, 390×844, 375×812 e 844×390.

Contrastes medidos nos elementos amostrados: Play 5,91:1; título/passos 13,25:1; recomendação 6,87:1; auxiliar de procedência 7,08:1. Foco explícito e controles por teclado/Shift-pan verificados. Não há animação decorativa automática adicionada. Sem novas bibliotecas, fontes de rede ou migração do Three.js.

## Fluxo operacional

O operador escolhe um dos três cards e a etapa. Título, programa e status têm locais principais. O003 identifica Desbaste e mostra T3/Ø32, S1800, F5400, G54. A vista conserva trajetória real, ponto zero, fixação ilustrativa, giro, zoom, pan e Play.

Desenho fica na aba ao lado de 3D, com as cinco páginas, zoom, mover, ajustar e ampliar. O vínculo página/detalhe continua a confirmar quando não cadastrado. O checklist está na aba lateral: não bloqueia consulta, troca de etapa ou Play. Iniciar/concluir é um registro operacional separado.

Abaixo: instruções de trabalho, X0/Y0 no centro e Z0 no topo, enviados pela engenharia; operador ajusta a origem e preseta ferramentas. Depois: preparação das oito ferramentas. “Preparar” abre os campos daquela ferramenta e compartilha os mesmos registros com a lateral, sem mudar a etapa.

Conferência final preserva os campos cadastrados: espessura 96,0 mm no segundo faceamento e propostas in-process existentes. Não cria novas cotas. Onde não existe critério, mostra A confirmar; observação e registro de conclusão continuam separados. A terceira operação aguarda dados.

## Regra de comprimento

Descida máxima é o valor absoluto do Z mínimo resolvido da ferramenta no programa atual, quando há referência Z0 no topo. Não é comprimento total. O domínio preserva o Z original e a soma exata; a UI mostra a descida sem reduzir a precisão útil. A recomendação é `ceil(descida + margem)`, em mm inteiro, com margem padrão 10 no cadastro, configurável globalmente e por ferramenta.

Exemplos testados: 99,97 +10 →110; 83,20 +10 →94; 104 +10 →114; 99,10 +10 →110; margem 3 em descida60 →63. O008/T4: descida72,421 →83; a preparação do trabalho considera também O004 e recomenda107 para T4. Os escopos ficam separados.

Só calcula quando a análise upstream completou sem falhas impeditivas, há movimentos de trabalho finitos e WCS único no escopo e a referência é topo. Macros/estado modal/subprogramas são resolvidos pelo kernel existente; falhas ou diagnóstico não resolvido impedem recomendação. G53 não localizado não vira profundidade da peça. O aviso de compensação XY nominal não é tratado como garantia de corte real. Análise incompleta e macro não resolvida foram testadas: A confirmar.

O001 tem Z mínimo0 no programa; não se inventa altura de montagem só a partir disso, pois o faceamento real usa corretor até limpar/fechar96. A medida física continua necessária. Preparação não garante colisão, rigidez ou corte útil; conjunto, porta-ferramenta, peça/fixação e preset precisam de conferência.

Na migração de registros antigos, medidas, observações e exceções de margem são mantidas; confirmações de comprimento/liberação antigas são invalidadas para reconferir a nova regra. Registros persistem por navegador, sem sincronização.

## Arquivos alterados

Base preservada, sem reconstrução: `work/prototype-template.html`, `operator_markup.html`, `operator_layer.js`, `build_prototype.py`, `package_poc.py` e o HTML gerado. Novos: `industrial.css`, `tool_length_domain.js`, `test_tool_length_domain.cjs`, `verify_industrial_ui.cjs`, provas de auditoria em `work/ui-review/` e estes relatórios. Cadastro de processo e payload/trajectórias CNC preservados.

Testes antigos adaptados aos controles/seletores retirados: `verify_operator`, `verify_strategy_ui`, `verify_mobile_origin`, `verify-prototype`, `verify_os_mounting`, `verify_program_panel`, `verify_tool_dimensions`. Não foram substituídas verificações de liberação, geometria, medições ou persistência por simples snapshots.

## Testes executados — todos passaram

- Domínio: exemplos de arredondamento por excesso, exatidão, margem3, inválidos, Z não resolvido, referência não topo e faceamento Z0.
- UI industrial: 1920/1440, lateral por programa e múltiplas ferramentas, lista inferior, persistência, editor de preparação, medida curta, análise incompleta/macro não resolvida, desenho, estratégias, navegação/Play livres e celular emulado.
- Regressões: operador/checklist/status/conferência; estratégias e linhas L/N; zoom por pinça emulado; interação desktop; orientação/OS/margens/migração; painel por programa; alturas reais da ferramenta/ponta; quatro fixações e cavidades.
- Dados: testes Python de montagem, estratégias, POC e lote CNC (sete casos), hashes das 16 cópias originais.
- Visual/acessibilidade amostrada: capturas desktop, regiões inferiores e programa multiferramenta; contrastes, alvos, rotação por teclado, pan com Shift e ausência de overflow em telas menores.

Relatórios JSON em `outputs/CNC/`; métricas, contrastes e capturas em `outputs/docs/`. O teste industrial é repetido no site após a publicação, com relatório separado de verificação HTTP/conteúdo.

## Skills e decisões

[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) instalada e usada em contraste, hierarquia e Three.js; [UI Audit](https://github.com/scottkw/ui-audit-skill) instalada/avaliada e ciclo aplicado ao Codex, com frontend-design disponível. Recomendações genéricas Hero/CTA e storytelling foram rejeitadas. Azul/logo Columbia, tipografia local, dados reais e interface existentes preservados. UI Audit é originalmente para Claude Code; não foram instaladas configurações do Claude no ambiente Codex.
