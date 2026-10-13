# Ferramental — inspeção antes da implementação

Base inspecionada: gerador HTML estático, camada operacional, domínio ToolLengthRule, configuração de processo, extração CNC/estratégias e testes existentes. O frontend é HTML/CSS/JavaScript com Three.js e gviewer; nenhuma arquitetura React será importada.

- O 3D já ocupa cerca de 66% da região principal; preservar tamanho e controles.
- A lista inferior mistura preparação em uma linha compacta e não separa máquina, posição física e T lógico.
- O editor reutiliza o card atual, mas não possui progresso, representação de montagem, cadastro de posição nem confirmação registrada.
- Estado existente guarda medidas e quatro confirmações por T; migrar sem perder registros e sem criar cópias independentes.
- Workflow Vision encontrado em C:/Users/User/Desktop/workflow-vision, com remoto gustavodemelomartins-hub/workflow-vision. Lidos tools-tab.tsx, mes-data.ts, preset-dashboard.tsx e tool-occurrence-dialog.tsx: referências para slots, destaque Neste serviço, detalhe, foto ausente, altura/corte e ocorrência. Componentes React/Next não são compatíveis diretamente. O detalhe atual dele apresenta slot como T lógico; essa associação não será reaproveitada.
- Fotos/dados da Lima & Bonfá não serão transferidos para Columbia. Histórico será local e simples, sem sistema social.
- Perfis Portal compartilham base provisória; Mini Portal não herda capacidade nem dimensões. Referência atual Eurostec confirma dimensões/BT50/24, mas informa Siemens 828D; Mitsubishi M80A será mantido como referência do pedido, com origem e pendência explícitas.

Capturas anteriores: screens/ferramental-before-refinements-1920-visual.png e screens/ferramental-before-refinements-1440-visual.png. Direção: preservar identidade Columbia, alvos de 44px, números grandes, status com texto, foco visível e detalhe em diálogo; ferramental fica abaixo/por atalho, sem comprimir o 3D.
