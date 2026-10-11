# Ferramental e magazine virtual — entrega

## Resultado

O protótipo continua no mesmo HTML/Three.js, com operação atual, 3D grande e somente as ferramentas do programa na lateral. A área inferior evoluiu para Ferramental com três entradas: Magazine da máquina, Ferramentas deste trabalho e Preparação. O atalho Preparar ferramentas no cabeçalho abre a preparação sem modificar a etapa atual.

- Trabalho OS 10-713 vinculado à **Mini Portal**, pelo cadastro do processo.
- O catálogo segue os T dos O001–O008; não há lista nova de oito ferramentas hardcoded.
- T lógico e posição física são independentes. Mini Portal inicia com capacidade e posições físicas desconhecidas; nenhum magazine de 24 posições é atribuído a ela.
- Portal 1/2 são máquinas distintas com referência-base compartilhada de 24 posições, provisória. Uma posição sem cadastro não é tratada como vazia; é possível registrar posição vazia após conferência humana.
- Progresso informa necessárias, preparadas e pendentes, com lista do que falta. Estados: NÃO INICIADA, EM PREPARAÇÃO, PRONTA, A CONFERIR.
- Detalhe grande reúne representação genérica, descida exata, montagem arredondada para cima, margem, parâmetros reais, comprimento medido, corretor e quatro confirmações. O botão Confirmar preparação permanece visível enquanto o conteúdo rola.
- Registro de posição física separado, com prevenção de duas ferramentas na mesma posição. Campo vazio preserva A confirmar.
- Holder, corte útil físico, foto local e observações podem ser cadastrados na seção fechada Cadastro físico e observações. Corte útil desconhecido não aparece como número nem é inferido do Z. Histórico simples registra preparação, posição e ocorrências, por máquina/ferramenta.
- Uma foto cadastrada aparece no detalhe e nos cards. Não há download de fotos semelhantes da internet nem transferência de fotos da Lima & Bonfá.

## Descidas e montagem

O domínio anterior ToolLengthRule e a evidência modal/WCS/diagnósticos permanecem a fonte dos cálculos. T3 mantém 99,97 mm de descida e 110 mm de montagem (+10 mm, arredondando para cima). A margem vem da configuração existente e conserva exceções por ferramenta. T4 distingue a necessidade de cada programa da montagem consolidada para todo o trabalho.

T1 continua com montagem padrão cadastrada pelo processo. Z nominal 0 está disponível, mas não é convertido em uma descida automaticamente resolvida: o diagnóstico M32 do programa continua impedindo essa conclusão. O comprimento físico deve ser medido e conferido. Recomendação não confirma máquina, preset ou ausência de colisões; Play/navegação permanecem livres.

## Arquitetura e estado

- MachineProfile: arquivo machine_profiles.json, PortalBaseProfile compartilhado e perfis independentes.
- Tool: catálogo derivado dos dados CNC atuais; descrição operacional existente mantém origem no cadastro do processo.
- ToolAssembly: holder e corte útil físico por montagem/máquina.
- MachineToolAssignment: ferramenta, montagem, posição física nullable, comprimento medido, corretor, montagem/na máquina e última conferência.
- JobToolRequirement: visão derivada de mountingRule para trabalho/programa, com descida, recomendação, margem e evidências.
- ToolPreparation: conferências de comprimento/corretor e última confirmação do trabalho, separadas da máquina.
- MachineMagazine: visão das posições/atribuições do perfil, sem inventar capacidade desconhecida.

A migração de armazenamento preserva comprimentos, checks e corte útil anteriores na Mini Portal. As funções antigas recebem visões compatíveis sobre os registros novos; medidas/checklists não são serializados em duas fontes. Dados operacionais, margens, fases e notas existentes são preservados. Consultar Portal 1/2 não muda a máquina do trabalho.

Armazenamento continua no navegador/dispositivo. Falha de armazenamento recebe aviso. Fotos aceitam PNG/JPEG/WebP até 2 MB; a foto não é declarada salva quando falta espaço. Nenhuma integração, login, servidor, estoque ou ERP foi acrescentado.

## Referência Workflow Vision

Repositório local encontrado em C:/Users/User/Desktop/workflow-vision, remoto gustavodemelomartins-hub/workflow-vision. Referência lida: components/mes/tabs/tools-tab.tsx, preset-dashboard.tsx, tool-occurrence-dialog.tsx e lib/mes-data.ts. Aproveitados conceitos de slots, Neste serviço, seleção, detalhe, foto ausente e conferência/histórico. Não importados React/Next, backend, dados/fotos da Lima & Bonfá, nem a associação slot=T lógico. Implementação adaptada em JavaScript/CSS da base Columbia.

## Fonte dos perfis

[Eurostec — FVM 2016L](https://eurostec.com.br/centro-de-usinagem-portal-fvm-2016l) confirma cursos 2200×1500×800 mm, mesa 2100×1300 mm, carga3500 kg, BT50 e 24 posições na referência atual. Página apresenta Siemens828D. Mitsubishi M80A foi mantido como referência informada pelo usuário, com origem distinta e nota de divergência; nenhuma configuração foi apresentada como levantamento confirmado da máquina física Columbia. Portal 2 identifica explicitamente perfil provisório baseado na Portal 1. Mini Portal conserva modelo, mesa, cursos, capacidade, cone e comando como desconhecidos.

## Validação

- test_tooling_domain.cjs: migração, visões canônicas, capacidade nullable, 24 posições provisórias, atribuições isoladas, conflito de posição e preparação.
- verify_tooling.cjs: percorre O001–O008; atualiza ferramentas atuais e destaque; mantém sidebar limitada ao programa; descidas/recomendações; rejeita medida curta; confirmação manual; posição/corretor/corte físico/ocorrência e persistência; 0/8→5/8; Mini sem slots inventados; Portal1/2 isoladas; migração; foto local e foco por teclado.
- Regressões existentes: verify_operator, verify_industrial_ui, verify_operator_refinements, verify_tool_dimensions, verify_mobile_origin, verify_strategy_ui, verify_fixtures, verify_program_panel, verify-prototype, verify_os_mounting.
- test_tool_length_domain e sete testes Python de CNC/estratégias/montagem.
- a11y_probe: contraste e controles operacionais/teclado/responsividade.
- 16 hashes dos originais conferidos sem alteração.

Navegador Chromium real: 1920×1080 e 1440×900; 390×844 para responsividade emulada. Não foi validado um monitor físico na fábrica. Mantidos aproximadamente66% de largura para o visual e alturas620/550px no desktop. Scroll vertical intencional; tabela possui rolagem local em tela pequena. Diálogo sem overflow horizontal.

Problemas encontrados e corrigidos na inspeção: grade antiga comprimindo o novo detalhe, diâmetro formatado por helper de listas, fechamento deixando campos invisíveis duplicados, confirmação escondida no scroll e perda de foco ao marcar checkboxes. Capturas repetidas após correções.

## Capturas

Estado inicial, sem registros fictícios:

- [Processo1920](screens/tooling-clean-1920-process.png)
- [Mini Portal1920](screens/tooling-clean-1920-mini.png)
- [Preparação1920](screens/tooling-clean-1920-preparation.png)
- [Detalhe1440](screens/tooling-clean-1440-detail.png)

Capturas ferramental-* registram dados de QA em contexto isolado (por exemplo, posição17 e corte útil15). São testes de comportamento; esses valores não são cadastro real da Columbia nem foram incorporados à publicação.

## Arquivos

Novos: work/ferramental/tooling_domain.js, tooling_ui.js, tooling.css, machine_profiles.json, test_tooling_domain.cjs, verify_tooling.cjs e visual_probe.cjs.

Integração: work/operator_layer.js, operator_markup.html, prototype-template.html, build_prototype.py e operator_process_config.json. Dois testes anteriores atualizados para os novos controles/colunas, preservando as verificações de comportamento. Gerados outputs/Prototipo_Processo_Columbia.html, Cadastro_Processo.json, MachineProfiles.json, CNC/Validacao_Ferramental.json e capturas. Fontes completas entregues no pacote de reprodução existente.
