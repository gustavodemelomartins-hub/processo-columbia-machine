# Continuidade — Processo Columbia Machine

Trabalhe neste frontend existente. A fonte editável está em src/; index.html é gerado por python scripts/build.py. README.md descreve responsabilidades e comandos. Não reconstruir o aplicativo para mudanças pontuais.

Decisões atuais do operador:
- Piloto na Mini Portal; capacidade/posição física desconhecidas permanecem null. T lógico não é posição física.
- Primeira operação: duas faces O001. Segunda: sete programas O002–O008; O004 é uma única etapa com duas ferramentas. Instruções de montagem/referência ficam em O002; depois instruções específicas.
- Lista simples de ferramentas, campos físicos e fotos; não restabelecer o workflow antigo de preparação/checklist. T e descrição separados. A lateral lê a mesma atribuição da tabela.
- Corretor na Mini Portal: (diâmetro real − nominal)/2; Ø25→23,5 resulta −0,75. Preenchimento explícito, sem sobrescrever automaticamente. Nominal do TAP permanece separado da medida real.
- Descidas resolvidas do TAP preservam precisão; montagem recomendada usa ceil(descida+margem). Não significa garantia contra colisão. T1: limite operacional 1 mm, Z nominal do TAP 0.
- Status por registro manual: Iniciar etapa→Em execução; Concluída→Concluída. Navegar/Play não iniciam nem concluem produção. Progresso ponderado por tempo com +20%, O001 duas vezes/O004 uma vez; terceira operação desconhecida.
- In-process de O005/O007 é proposta de engenharia, sem alteração de TAP. Calibrar primeira cavidade com sobremetal antes do passe final, que fecha a cota/tolerância do desenho. Não fixar 105,5 como cota final nem inventar tolerâncias.
- Estudo de insertos T3 é manual; consulta/Play não somam cavidades. Linhas de consulta por cavidade mantêm vínculo/hash do original.
- T9: corte visual de referência 30 mm, saída visual 40 mm; comprimento medido tem prioridade. Foto real pertence à ferramenta/máquina e fica no navegador.

Preservar parser, TAPs originais, 3D grande, toolpath, desenho, responsividade, armazenamento/migrações existentes e registros históricos. Não adicionar rede, login, servidor ou envio ao CNC nesta entrega. Regras ficam em domínios; componentes leem dados compartilhados.

Depois de editar: build, testes relevantes, hashes dos originais e inspeção das capturas em 1920×1080/mobile. npm test contém os fluxos atuais; artefatos novos ficam em artifacts/. Não incorporar medidas ou fotos de fixtures ao HTML.
