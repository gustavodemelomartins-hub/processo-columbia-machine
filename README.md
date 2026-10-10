# Processo Columbia Machine

Procedimento operacional digital de usinagem — OS 10-713. Preserva o protótipo atual e os dados reais de O001–O008.

[Site](https://gustavodemelomartins-hub.github.io/processo-columbia-machine/)

## Operação

Escolha o card e a etapa. Título, programa e status no alto; 3D dominante e painel somente das ferramentas do programa atual. O003: T3/Ø32, S1800, F5400, G54. Desenho de cinco páginas na aba vizinha, com zoom/pan/ajuste/ampliação. Mouse, teclado e zoom por pinça disponíveis.

Passos numerados e referências abaixo. Lista completa das oito ferramentas depois, para preparação antecipada. Preparar usa os mesmos registros da lateral. Checklist não bloqueia navegação ou Play; execução é registro separado. Registros ficam no navegador, por dispositivo, sem sincronização.

## Comprimentos

Descida máxima exata separada da montagem recomendada inteira: 99,97 + margem10 →110 mm. Domínio único com arredondamento para cima. Margem configurável; medida fora da pinça e corte útil são físicos e separados. Só recomenda com análise resolvida em relação a Z0 no topo; caso contrário A confirmar. Lista do trabalho considera todos os programas da ferramenta. Recomendar não autoriza execução nem garante colisão/rigidez. Confirmações antigas de comprimento são invalidadas, conservando medições/observações/exceções.

## Engenharia e CNC

X/Y centro e Z topo enviados pela engenharia; operador ajusta origem/preseta ferramentas. Alinhar por fora. O001: primeiro lado invertido até limpar via corretor; tombar uma vez; segundo até96,0 mm; elevar para os quatro calços sem novo tombamento. Orientação cadastrada pelo usuário, não extraída do TAP. Terceira operação a definir.

Trajetória nominal extraída do CNC; montagem/fixação ilustrativas, sem remoção de material, colisão física ou comandos enviados à máquina. Alturas 3D consideram medida ou estimativa identificada; porta-ferramenta ilustrativo e corte útil desconhecido não inventado.

Detalhes técnicos fechado por padrão: estratégias, M6/subprogramas, linhas L/N e tempos. AP/AE não declarados no lote. Linhas localizam código; não validam retomadas. [Auditoria antes](docs/ui-audit-before.md) e [depois](docs/ui-audit-after.md).

## Publicação

index.html é o HTML gerado pelo projeto original; arquivo independente com recursos incorporados. Cadastro_Processo.json é incorporado na geração: editar somente o JSON publicado não muda o HTML. GitHub Pages publica a raiz main. PDF em Desenhos conserva bytes do original; TAPs imutáveis no projeto local. Repositório/site públicos.

Three.js, @sienci/gviewer e easy_gcode_plot: MIT; atribuições em Licencas. Logo/favicon Columbia: [fonte oficial](https://columbiamachine.com.br/); não atribuída licença aberta aos ativos da empresa ou desenho.
