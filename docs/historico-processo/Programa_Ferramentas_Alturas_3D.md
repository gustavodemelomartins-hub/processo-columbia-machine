# Programa, ferramentas e alturas no 3D

Antes, a conclusão ficava fora do card, a referência sugeria presença da engenharia na máquina, a navegação dependia de conferências e o modelo usava alturas fixas para todas as ferramentas. Dados do programa ficavam no fim da página e a lista de ferramentas era dividida por operação.

Agora, o OK fica dentro do card, no canto superior direito, verde ao marcar. Engenharia envia a origem: X/Y no centro e Z no topo. Operador ajusta origem e preseta ferramentas; confirmações continuam manuais.

No O001, facear o primeiro lado até limpar ajustando o corretor, tombar uma vez e fechar 96,0 mm no segundo lado (1 mm acima da medida final cadastrada de 95 mm). Não se presume metade da retirada em cada face. Bruto e medida após o primeiro lado são registros opcionais. Essas instruções são dados de processo informados pelo usuário, não extração do TAP.

Navegar e reproduzir o percurso independe do checklist, da medida final e das conferências propostas de acabamento. Play é consulta; não inicia execução nem valida uma retomada.

O desenho/3D permanece à esquerda, programa e parâmetros no meio e a lista total das oito ferramentas à direita, com checklist/conferência na aba vizinha. Programa da etapa mostra todas as ferramentas M6 e as chamadas de subprogramas/macros identificadas no código. Estratégias mostram RPM, avanço, WCS, Z e tempo. Referências físicas L e blocos N ficam em “Linhas do programa”. AP/AE permanecem não determinados quando não cadastrados. Não há campo de processista na tela operacional.

A ponta da ferramenta no 3D coincide com XYZ da trajetória. Medida fora da pinça posiciona o início do porta-ferramenta; corte útil medido dimensiona a parte cortante. Campo próprio permite informar o corte útil sem confundi-lo com a descida total de Z. Mudanças persistem neste navegador e invalidam a conclusão correspondente, sem bloquear a consulta.

Sem medida, ferramentas com descida positiva usam montagem estimada (descida máxima + margem adotada), explicitamente identificada. T1 não recebe altura de montagem inventada. Sem corte útil informado, anel nominal de diâmetro e haste em arame indicam modelo incompleto. Corpo/diâmetro do porta-ferramenta são ilustrativos mesmo com a montagem medida.

Montagem curta gera aviso no Z atual; a ponta e o percurso não são deslocados para esconder uma interferência. Corte útil maior que a montagem também gera aviso. Não há remoção de material, cálculo de rigidez ou validação física de colisões.

## Arquivos alterados

Fontes canônicas preservadas em `Fontes_Reproducao_POC.zip`: `prototype-template.html`, `operator_markup.html`, `operator_layer.js`, `operator.css`, `operator_process_config.json`, `strategy_ui.js`, testes de operação/estratégias/origem/desktop, novos `verify_program_panel.cjs` e `verify_tool_dimensions.cjs`, e lista de empacotamento. Entregas: `Prototipo_Processo_Columbia.html`, `Cadastro_Processo.json`, `Leia-me_Prototipo.txt`, relatórios e capturas.

## Verificação

Testes em Chromium desktop e celular emulado: posição/cor do OK, origem/preset, facear até limpar sem divisão automática, navegação livre inclusive após acabamento, Play sem checklist, chamadas M6/M98/G65 e linha original, oito ferramentas, layout e persistência. Geometria: ponta no percurso, montagem medida e estimada, corte útil, folga de 3 mm, montagem curta sem alterar trajetória, troca de ferramenta e T1 sem altura inventada. Testes existentes: operador/desenho/conferência, estratégias, montagem/calços e toque/zoom. Relatórios em `CNC/Validacao_Programa_Ferramentas.json` e `CNC/Validacao_Alturas_3D.json`. QA visual real por capturas de Chromium, sem teste em aparelho físico.

TAPs originais não foram editados. Mantidos engine, trajetória, fases e estrutura existentes.
