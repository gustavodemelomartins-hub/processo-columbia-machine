# Processo Columbia Machine

Protótipo de procedimento operacional digital de usinagem para a OS 10713, FP 16F H8 12V.

Site: https://gustavodemelomartins-hub.github.io/processo-columbia-machine/

Esta publicação conserva o protótipo atual: sequência de operações, consulta do desenho, percurso CNC, ferramentas e checklist. O index.html é a cópia publicada do protótipo local. O PDF em Desenhos mantém os bytes do original.

## Uso

Abra o site no PC ou celular. Use as abas 3D e Desenho; escolha a operação/etapa e confira as ferramentas e referências.

Registros de conferência ficam no armazenamento do navegador, por dispositivo. PC e celular não sincronizam os registros. Acesso ao site e ao repositório é público.

O percurso vem do programa; montagem, calços e referências ilustrativas dependem de confirmação humana. Esta versão não verifica colisões físicas nem envia comandos à máquina.

## Atualização

Atualize index.html com o protótipo gerado pelo projeto atual. Mantenha Desenhos e Identidade_Visual junto dele. GitHub Pages publica a raiz da branch main; .nojekyll mantém os arquivos estáticos.

Os programas .TAP originais continuam preservados no projeto local e não são editados pela publicação.

## Atribuições

Bibliotecas: Three.js e @sienci/gviewer (MIT); análise pré-calculada com easy_gcode_plot (MIT). Licenças e atribuições estão em Licencas.

Logo e favicon: Columbia Machine Brasil, obtidos de https://columbiamachine.com.br/. Consulte Identidade_Visual/Identidade_Columbia.json para fontes e identidade observada. Não foi atribuída licença aberta aos arquivos da empresa ou ao desenho técnico.

## Celular e origem da engenharia

No 3D, um dedo gira e dois dedos ajustam o zoom. Os botões + e − também estão disponíveis no celular.

X0/Y0 vêm no centro da peça por padrão de engenharia. O operador confere a referência na máquina; esse cadastro não confirma o checklist automaticamente. Cadastro_Processo.json registra reference_defaults e exceções em steps[].references. Para publicar alterações, edite o cadastro no projeto de origem e gere novamente o HTML; editar apenas esse JSON publicado não modifica o index.html incorporado.

## Operações e estratégias

Três cards grandes organizam as operações. A preparação deste trabalho orienta alinhar a peça por fora. O 3D conserva apenas as três linhas na origem, sem texto, setas periféricas ou batente amarelo.

Em Detalhes técnicos, consulte estratégias PERCURSO, linhas físicas L e blocos N, trocas M6, primeiro movimento de corte, parâmetros e tempos aproximados por estratégia. Os botões abrem o trecho original destacado. Essas linhas localizam o código e não aprovam retomadas.

AP/AE não foram declarados neste lote e aparecem Não determinado. O tempo do cabeçalho é separado da estimativa da trajetória (rápido assumido 10.000 mm/min, sem aceleração, trocas, paradas e G53 não localizado). Dados estruturados: CNC/Estrategias_Programa.json.
