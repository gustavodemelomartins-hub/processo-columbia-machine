# Proposta de in-process — peça piloto / Mini Portal

## Objetivo

Calibrar e validar uma cavidade de referência antes de liberar as demais. Considerar o diâmetro real das fresas reafiadas e a concordância do acabamento com os raios, buscando reduzir repasses.

## O005 · acabamento com T8

O TAP atual traz três estratégias nomeadas: acabamento 0,3, 0,1 e 0,0, com G41. Comentários originais: L18/N12, L2371/N2365 e L4635/N4629. Não há estratégia nomeada acabamento 0,2 nesse arquivo. Esses nomes são evidência do programa; não confirmam a medida final da cavidade física.

Proposta:
1. Acabar primeiro uma cavidade de referência mantendo **0,2 mm de sobremetal** para calibrar a medida intermediária.
2. Medir e calibrar o corretor considerando a ferramenta real/reafiada.
3. Dar mais um passe nessa mesma cavidade para fechar a cota real do desenho e validar a medida.
4. Liberar a sequência revisada para as demais cavidades após validar a primeira.

Cotas finais confirmadas por leitura do desenho original, página 1, detalhe B (Cavidade): **105,7 ±0,1 mm** e **243,4 ±0,1 mm**. O alvo intermediário é a cavidade com 0,2 mm de sobremetal para calibrar; 105,5 mm não é um alvo fixo cadastrado. Não foi calculada distribuição desse sobremetal por parede nem conversão automática em corretor D/G41. O passe final fecha a cota do desenho.

## O007 · concordância do raio com T6

O programa atual usa T5 e T6. Para T6, traz os percursos de raio 0,2, 0,1 e 0,0 com G41, em L216/N209, L1902/N1895 e L3590/N3583.

Proposta:
1. Acabar o raio com T6 na mesma cavidade de referência já acabada por T8.
2. Conferir a concordância entre os acabamentos e a ausência de degrau.
3. Calibrar o corretor de T6 e validar o raio e o contorno dessa cavidade.
4. Liberar a sequência revisada para as demais cavidades após validar a primeira.

## Situação da proposta

Apresentada no protótipo, em Detalhes técnicos de O005 e O007. Os TAP originais e a simulação de seus percursos continuam preservados. A execução por cavidade e a parada para medição precisam ser programadas na revisão CNC; não foram inseridos M0 ou blocos novos.

O tempo exibido continua sendo a estimativa do arquivo atual, não uma estimativa do percurso proposto. A economia mencionada pelo operador, da ordem de 20 minutos por forma, é uma expectativa a medir no piloto, não um resultado comprovado.
