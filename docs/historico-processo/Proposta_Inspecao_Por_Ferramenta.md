# Processo da peça — OS 10713
Meta de processo definida pelo usuário: 96,0 mm antes do tratamento e 95,0 mm depois. O desenho atual indica 95,75 mm antes; alinhar revisão com engenharia.

## Setup 1 — somente O001
1. Medir a espessura bruta e registrar o sobremetal total em relação a 96,0 mm.
2. Definir a retirada total em cada face; não confundir com profundidade por passe.
3. Alinhar pela referência escolhida: varão/ranhura, dois encostos retificados ou borda da mesa. Confirmar os contatos e a fixação lateral no conjunto real, com duas garras em cada extremidade, nas mesmas posições em planta da segunda operação. Conferir o lado pelas cavidades; posição nas ranhuras ainda a confirmar.
4. Facear o primeiro lado com O001. O programa fornecido faceia Z0; os valores de retirada do processo não alteram o arquivo.
5. Tombar, alinhar e prender novamente; conferir o lado e a origem.
6. Facear o segundo lado com O001.
7. Medir a espessura final e registrar a conferência antes de subir nos calços.

## Setup 2 — O002 a O008
Montar sobre quatro calços curtos nas extremidades. Cada garra deve apertar por cima da peça, diretamente sobre um dos apoios. Os calços não atravessam as cavidades. Fixar, alinhar e conferir o WCS. As posições da vista são ilustrativas, não extraídas dos .TAP.
- O002: referência / T9.
- O003: desbaste / T3.
- O004: alívios / T12 e T4.
- O005: acabamento / T8. In-process proposto: completar uma cavidade, retirar e parar para medir e conferir o corretor antes de repetir.
- O006: cantos / T5.
- O007: T5 e T6, cantos e raios. In-process proposto após o par: verificar o degrau, registrar ajuste e conferir a retomada.
- O008: espaçador / T4.

Os M0 de inspeção e a virada são propostas de revisão. Não existem M0 nos oito originais. A posição de retirada e a retomada devem ser definidas pelo programador e validadas no processo; nenhum .TAP foi alterado.

## Ferramentas e trajetória
Preparar ferramentas durante os ciclos longos, usando o checklist agrupado por operação.
A profundidade Z vem do kernel easy_gcode_plot. O cálculo profundidade + 5 mm depende de Z0 no topo e é alcance preliminar. Conferir comprimento de corte, porta-ferramenta, rigidez e interferências com geometria real.
O001: FACEAMENTO, T1 Ø100, S900, G54. M32 não modelado.
O005/O007: percurso programado, compensação G41 não validada com os cadastros disponíveis.
T12: nome R0,8 e coluna de raio 0, a confirmar.
WCS e corretores reais D/H não foram fornecidos. G53 não é desenhado sobre a peça sem localizar a máquina.

Consulte Estudo_e_POC_CNC.md e o manifesto no diretório 08_Simulacao_3D/CNC.


## Organização na apresentação
Primeira operação: O001, três subetapas e lista T1. Segunda: programas O002–O008 recebidos, com lista própria de sete ferramentas únicas. O conjunto está parcial. Terceira: aguardando programas e definição; nenhuma sequência ou ferramenta presumida.

## Tela operacional
Operação/etapa e programa dominam o topo, seguidos do próximo passo e referências. Consulta 3D/desenho com as cinco páginas do PDF. Ferramentas do programa atual aparecem primeiro; as próximas ficam recolhidas. Checklist indica prontidão local; confirmação de comprimento exige medição e marcação manual. Conferências sem cota cadastrada continuam a confirmar. Registro de execução não envia comando à máquina. Cadastro_Processo.json prepara revisões e vínculo de desenho por etapa. Consulte Resumo_Simplificacao.md.
