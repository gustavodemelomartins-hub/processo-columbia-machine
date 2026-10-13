# POC CNC — Processo Columbia Machine
Data: 10/10/2026. Lote: OS 10713, FP16F 12V H8. Os oito .TAP originais foram lidos sem alteração.

A decisão desta POC é usar o kernel do **easy_gcode_plot** para execução CNC e um componente do **gviewer** para desenhar sua trajetória dentro da cena existente. Não foi criado um interpretador CNC próprio. A estrutura de processo, fotos, checklist e montagem do protótipo foram preservados.

## Projetos avaliados

| Projeto | Versão / revisão examinada | Licença e resultado |
|---|---|---|
| easy_gcode_plot | 1.9.8; commit 98894b34fb80cc73f12c0ebf3a69e9baca7448f2 | MIT, LICENSE.md preservado. Motor escolhido. CLI analyze, trace e batch executadas. |
| @sienci/gviewer | 0.1.33; commit 683cfaf93895b02182b3728d85af175dc12d405e | MIT declarada no package.json; esta revisão não contém arquivo LICENSE separado. Componente de renderização integrado com atribuição e texto MIT. |
| cncjs/gcode-toolpath | 3.0.0; commit 1dc75a188c0e56f3a7732614b6801ce231654830 | MIT. Referência complementar de interface entre estado modal, linhas e arcos. |
| cncjs/gcode-parser | commit 0df4f3dce3f9a27a5293828f741736e0e88ec0e5 | MIT. Referência de tokenização; não substitui a execução de macros. |
| CAMotics | código/documentação e COPYING oficiais consultados | COPYING contém GPL v2. Mantido como referência de remoção de material; nenhum código incorporado e nenhuma simulação CAMotics executada nesta POC. |

Fontes: [easy_gcode_plot](https://github.com/MaestroFusion360/easy_gcode_plot), [kernel](https://github.com/MaestroFusion360/easy_gcode_plot/tree/98894b34fb80cc73f12c0ebf3a69e9baca7448f2/app/gcode/kernel), [CLI](https://github.com/MaestroFusion360/easy_gcode_plot/blob/98894b34fb80cc73f12c0ebf3a69e9baca7448f2/app/cli.py), [gviewer](https://github.com/kglovern/gcode_parser_viewer), [precomputed.ts](https://github.com/kglovern/gcode_parser_viewer/blob/683cfaf93895b02182b3728d85af175dc12d405e/src/viewer/toolpath/precomputed.ts), [gcode-toolpath](https://github.com/cncjs/gcode-toolpath), [gcode-parser](https://github.com/cncjs/gcode-parser), [CAMotics](https://github.com/CauldronDevelopmentLLC/CAMotics), [COPYING do CAMotics](https://github.com/CauldronDevelopmentLLC/CAMotics/blob/master/COPYING).

## Primeira prova: O001

Primeiro foram executadas analyze e trace com --lang fanuc_mill. Essa opção é necessária: a CLI usa turning por padrão para .tap. O motor rodou em Python 3.14.7, sem instalar a interface Qt ou modificar o código upstream; utilizou a implementação Python disponível no repositório.

Resultado conferido: FACEAMENTO, T1 GIRASSOL D100MM, Ø100, raio de ponta 6 na coluna, S900 e G54. A variável #1=1 e T#1 foram resolvidas pelo motor; M6 ativa a ferramenta.

A trajetória contém 25 movimentos lógicos, dos quais 18 são de avanço. Foram confirmadas **oito passadas longas em X** em Z0, alternando X±557,45, nos Y:
-259,904; -185,646; -111,387; -37,129; 37,129; 111,387; 185,646; 259,904 mm.
Entrada/saída em X587,45. A animação anterior era ilustrativa, com cinco passadas e amplitudes aproximadas. O novo percurso usa os valores executados do arquivo.

M32 gera UNSUPPORTED_M_CODE. Esse comando não foi removido nem considerado validado. G53 e as transferências cujo início ainda não tem X/Y/Z de trabalho ancorados permanecem no relatório do motor, mas ficam fora da sobreposição na peça. Não se supõe que Y900 de estacionamento seja dimensão da peça.

O001 foi mostrado na cena existente usando createPrecomputedToolpath do gviewer, com cortes azuis e rápidos âmbar. Play, indicação de T/linha/N e funcionamento offline foram testados antes de generalizar para o lote.

## Generalização e manifesto

Os oito arquivos foram processados pelo mesmo execute_program e pelo batch da CLI. Os relatórios identificam oito ferramentas únicas: T1, T9, T3, T12, T4, T8, T5 e T6.

O manifesto inclui arquivos e hashes, sequência, comentários PERCURSO, nomes/diâmetros/raios, T, RPM, avanços, WCS, tempos do cabeçalho e cinemáticos, profundidades Z, bounding boxes, G/M, seletores H/D, estados de compensação e diagnósticos. A ordem O001–O008 é a sequência proposta do processo; nomes e linhas PERCURSO são dados do programa.

Os comentários da tabela de ferramentas deste pós-processador foram extraídos como metadados pelo adaptador. A descoberta automática de ferramentas do upstream retornou vazia para esse formato de cabeçalho. Isso não impediu a resolução de T#1 na trajetória. O adaptador não calcula movimentos, ciclos, macros ou arcos.

O005 e O007 geram UNVERIFIED_CUTTER_COMPENSATION com a configuração disponível. Seus percursos são identificados na tela como **compensação não validada**. Não foi atribuído um valor fictício aos corretores D/H. Um teste separado, com ferramenta nominal configurada, confirmou que o kernel aplica G41. O teste de macros/WHILE/M98-M99 e o de G10/G54 também passaram.

T12 apresenta conflito: nome ABACAXI D25 R0.8, coluna TOOL TIP RADIUS=0. Ambas as evidências permanecem no manifesto, com aviso.

## Integração na interface

As subetapas da operação selecionada, no topo, carregam a trajetória correspondente ao programa. O004 é separado por T12 e T4; a etapa O007 mostra T5 e T6 do próprio arquivo. Etapas de virada/calços são instruções de montagem e não recebem um percurso inventado.

O componente precomputed.ts do gviewer foi incorporado com remoção apenas dos tipos TypeScript. Ele recebe pares XYZ em buffers Float32Array dentro da cena Three.js existente. Não foi substituída a câmera, a máquina ou a interface pelo GCodeViewer completo. A cena continua em Three.js 0.160.1; o pacote completo declara peer three ^0.168.0, então a adoção do viewer inteiro exigiria uma atualização planejada. O componente isolado usado passou no teste desta versão.

O parser do gviewer foi testado com T1 e T#1: reconhece T1, mas não extrai T de T#1. Por isso não é a autoridade de interpretação do lote. O renderer recebe geometria resolvida pelo motor.

O Play percorre os segmentos calculados e apresenta a linha física do arquivo, N e T. É playback acelerado, com tempo aproximado por avanço e rápido assumido. Parar interrompe; um novo Play começa do início. Ciclos podem produzir vários segmentos para a mesma linha; não se exige relação um segmento/uma linha.

## Hipóteses e próximos passos

A sobreposição usa G54 visual no centro XY e topo Z, como dado de processo. O cadastro real de WCS, corretores, porta-ferramenta, máquina e dispositivos não foi fornecido. O tempo do motor assume rápido de 10.000 mm/min e exclui aceleração, trocas, dwell e paradas. Arcos são amostrados pelo próprio motor com erro de corda de 0,02 mm; os arcos lógicos permanecem nos traces.

Setup 1: O001 nas duas faces, com bruto medido, distribuição de sobremetal, virada e registro final. Meta confirmada pelo usuário: 96,0 mm antes do tratamento, 95,0 mm depois. O desenho indica 95,75 antes; alinhar sua revisão. Setup 2: calços, referência, desbaste, alívios, acabamento e cantos. M0/in-process são propostas e não existem nos originais.

A margem de 5 mm é um cálculo preliminar de alcance condicionado ao Z0 no topo. Não confirma ausência de colisões, comprimento de corte ou rigidez do conjunto.

CAMotics deve ser usado numa próxima validação independente de remoção de material, com bruto e ferramentas conferidos e um arquivo de entrada que ele interprete corretamente. Qualquer exportação expandida deve ficar separada dos originais e ser comparada antes do uso. O protótipo atual não afirma remover material nem verificar colisões.

O recebimento automático da rede continua sendo uma etapa futura. A POC já fornece análise em lote e manifesto reproduzível; não foi criada uma rotina de monitoramento sem a pasta/regras de revisão da fábrica.

## Evidências

- CNC/O001_POC: analyze e trace originais da CLI.
- CNC/CLI_batch: relatório JSON/CSV dos oito arquivos.
- CNC/Manifesto_Peca.json e .html: manifesto final.
- CNC/Provas_Recursos_Kernel.json: testes sintéticos, separados do lote.
- CNC/Comparacao_Parser_Gviewer.json: teste do parser frontend.
- CNC/Validacao_Interface.json: etapas, Play/linha, checklist, persistência, gates, desenho, CSV e tela móvel, offline.
- POC_O001_Percurso.png e Vista_Prototipo_Columbia.png: capturas da aplicação.
- Fontes_Reproducao_POC.zip: snapshot dos componentes, adaptador, testes, licenças e fontes da interface, sem os .TAP.

Nenhum programa CNC foi exportado por cima dos originais. As cópias do projeto e os arquivos D:\OS 10713 foram conferidos por SHA256.


## Revisão da navegação por operação
As operações passaram ao topo. A primeira abre três subetapas e T1. A segunda reúne O002–O008 recebidos, nove subetapas e sete ferramentas únicas. O conjunto da segunda operação está marcado como parcial. A terceira aguarda programas e definição de processo, sem percurso ou montagem presumidos. A navegação visualiza livremente as etapas e não registra conferências; a progressão pelo botão Próxima etapa mantém os registros de espessura e inspeção. A fixação lateral contém quatro garras, duas por lado, com posicionamento nas ranhuras provisório. Evidência atual: CNC/Validacao_Operacoes.json.
