# Auditoria depois — etapas e in-process

Escopo aplicado ao frontend atual: O004 em um único mini box, com T12/T4; segunda operação com sete etapas, O002–O008. Primeira operação mantém os dois faceamentos físicos. A etapa histórica Ø16 permanece arquivada, com ID e notas preservados. Conclusão antiga de O004 migra como concluída somente quando ambas as etapas anteriores estavam concluídas; persistência e idempotência testadas.

Instruções de montagem, alinhamento e preset ficam em O002. As seguintes usam instruções específicas do cadastro: insertos no desbaste, duas ferramentas no mesmo O004, acabamento/in-process, cantos e espaçador. Referência operacional continua em seu local único.

Proposta de in-process em Detalhes técnicos de O005/O007, com quatro passos legíveis e sequência real do TAP recolhível. Em O005, 0,2 mm de sobremetal para calibrar a primeira cavidade, seguido de um passe final. Cotas 105,7 ±0,1 mm e 243,4 ±0,1 mm verificadas no desenho original, página 1, detalhe B; botão abre essa página. Não há alvo fixo 105,5 mm. Em O007, concordância T8/T6 e ausência de degrau. Nenhuma conversão automática em corretor. Tempo continua do programa original. Nenhum TAP ou trajetória foi alterado.

Inspeção visual em 1920×1080, 1440×900 e 390×844: 3D preservado em 620/550/390 px de altura, sem overflow horizontal da página; leitura e alinhamentos mantidos. Proposta longa usa rolagem própria na lateral desktop e fluxo vertical no celular. Botões de fontes ≥44 px, sem informação essencial dependente de hover. Capturas locais inprocess-flow e inprocess-o005/o007 nas três larguras.

Validação: O001–O008, duas ferramentas de O004, navegação anterior/próxima pulando o ID arquivado, conclusão/reabertura, três combinações de estados legados, notas, teclado, código original nas fontes. Contador T3 e consulta de todas as cavidades por mouse/toque continuam funcionando. Nove testes Python e regressões CNC/domínio/desenho/origem/tabela passaram. Relatórios CNC/Validacao_Inprocess_Local.json, CNC/Validacao_Simplificacao_Local.json, CNC/Validacao_Insertos_Local.json e docs/ui-accessibility-checks.json.

Limites: proposta de processo para apresentação; execução por cavidade requer revisão dos programas. Distribuição do sobremetal por parede não parametrizada; nenhum corretor foi calculado automaticamente. Ganho de tempo ainda não medido. Publicação não solicitada/autorizada após o bloqueio anterior; entrega funcional local, sem novo envio ao GitHub Pages.
