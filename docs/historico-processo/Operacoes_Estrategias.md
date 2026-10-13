# Operações e estratégias — atualização do protótipo

O procedimento atual foi preservado. Esta rodada organiza a navegação em três cards grandes e mantém o título da etapa abaixo deles. A terceira operação continua aguardando definição, sem programas inventados.

Em todas as etapas deste trabalho, a preparação informa **alinhar a peça por fora**, conforme relato do usuário. Essa orientação é dado de processo; não foi extraída do TAP.

No 3D, foram removidos o texto sobre o ponto zero, as setas periféricas e o batente amarelo ilustrativo. Permanecem apenas as três linhas no ponto zero sobre a peça. Cavidades, garras, apoios e trajetória existentes foram preservados.

## Consulta de estratégias

Abra **Detalhes técnicos**. O programa da etapa apresenta suas estratégias PERCURSO, ferramenta, diâmetro, raio, RPM, avanço, WCS, códigos explícitos de compensação, Z mínimo programado e tempo estimado. A análise utiliza as trajetórias já calculadas pelo kernel da POC; não introduz outro parser CNC.

Os botões de linha abrem um trecho do programa original com a linha destacada. **L** é a linha física do arquivo e **N** é o número do bloco CNC. Há referências ao comentário da estratégia, à troca M6 e ao primeiro movimento G1/G2/G3 localizado. Uma troca M6 pode ser compartilhada por várias estratégias da mesma ferramenta.

Exemplos de O005: acabamento 0,3 em L18/N12, acabamento 0,1 em L2371/N2365 e acabamento 0,0 em L4635/N4629. Em O007, os comentários reais indicam raios 0,2, 0,1 e 0,0, respectivamente em L216/N209, L1902/N1895 e L3590/N3583. Os nomes são mantidos exatamente como constam no programa; não se presume que esses números sejam AP ou AE.

As linhas localizam o código, **não são pontos de retomada aprovados**. Repassar exige conferir estado modal, referência, H/D e altura segura com a engenharia.

## Tempos e AP/AE

O tempo declarado no cabeçalho aparece separado da estimativa por trajetória, com horas/minutos/segundos. O tempo calculado usa comprimento dos segmentos e avanço programado; rápido assumido em 10.000 mm/min. Não inclui aceleração, trocas, paradas ou movimentos G53 não localizados. A máquina real pode levar um tempo diferente.

AP/AE não foram informados nos comentários deste lote. Aparecem **Não determinado**: profundidade Z não comprova sobremetal ou engajamento lateral real. A estrutura permite valores explícitos nos comentários quando fornecidos.

## Verificação

- 8 programas e 16 estratégias conferidos com os arquivos originais, linhas físicas e números N.
- Tempos calculados conferidos com os segmentos e avanços do kernel; G41 conferido inclusive quando seguido imediatamente por D.
- Navegação, instruções das 12 etapas, três linhas da origem, ausência de batentes/setas e trechos destacados testados no navegador.
- Fluxos existentes de operador, ferramentas, desenho, montagem e zoom por pinça testados.
- QA visual em desktop e tela móvel emulada; os 16 arquivos originais continuam preservados.

O relatório automático está em CNC/Validacao_Estrategias_Interface.json. Os dados estruturados estão em CNC/Estrategias_Programa.json. Os fontes atualizados estão em Fontes_Reproducao_POC.zip.
