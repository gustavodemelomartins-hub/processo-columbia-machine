# Processo Columbia Machine — tempos, T9 e estudo de insertos

Revisão local de 12/10/2026, sobre o protótipo existente. Testes em 1920×1080, 1440×900 e 390×844; inspeção visual das capturas. Mini Portal permanece a máquina do trabalho.

## T9 — representação de montagem

Corte útil de referência de 30 mm e saída de referência de 40 mm, dentro dos 40–45 mm informados pelo operador. Ferramenta sólida com marcas helicoidais ilustrativas, haste e porta-ferramenta genérico de proporção menor. Esses dados não são uma medição da montagem real nem geometria exata do porta-ferramenta.

Montagem medida na tabela tem prioridade sobre a referência. Verificado com 43 mm, recarga e remoção da medida. A ponta da ferramenta permanece no percurso do TAP. A descida real de O002 é 0,297 mm; o cálculo descida +10 mm continua em 11 mm e é apresentado separado da referência visual. No Z mínimo, a montagem visual de 40 mm posiciona o plano inferior do holder 39,703 mm acima do topo ilustrativo. Isso é uma verificação geométrica dessa representação, não validação de colisão da máquina.

## Registro de desgaste T3

O operador pode digitar o total do ciclo e tocar em “Registrei virada” ou “Registrei troca”. Exemplo testado: 6 cavidades e virada; depois 4 cavidades e troca. Histórico com dois ciclos e média de 5 cavidades/ciclo. Essas quantidades são dados de teste, não resultados reais da Columbia.

O registro encerra o ciclo e abre o seguinte em zero. Desfazer reabre o último ciclo com a quantidade declarada. Contagem +1 continua disponível. Quantidade vazia, negativa, fracionada ou zero ao encerrar um ciclo é rejeitada. Quantidade zero pode ser registrada como contagem corrente. Histórico e média persistem no navegador; exportação CSV inclui todos os ciclos, máquina, trabalho, tipo de registro, data e origem manual. O painel mostra os oito ciclos mais recentes; a exportação mantém o histórico completo. Eventos de desfazer são limitados a 50, independentemente do histórico de ciclos.

Círculos preenchidos dão retorno visual dos registros, sem pontuação competitiva ou meta de prolongar uso. A referência de cerca de cinco cavidades continua acompanhada de conferência de desgaste. Consulta de cavidade e Play não registram produção.

## Tempos e progresso

Cada mini box mostra tempo CNC +20%. Cabeçalho mostra tempo total previsto, restante previsto e progresso ponderado pelo tempo das etapas marcadas como concluídas. Cada operação também possui barra própria. Não há cronômetro real nem avanço automático por simulação.

O001 conta duas vezes, uma por face. O004 conta uma vez com as duas ferramentas. Total dos programas recebidos: 24.365 segundos previstos (6 h 46 min 05 s), apresentado como 6 h 47 min com arredondamento para cima ao minuto. Primeira operação: 1.368 s; segunda: 22.997 s. Terceira operação mantém tempo a definir e não recebe estimativa inventada. A porcentagem exibida arredonda para baixo para evitar 100% com etapa pendente.

## Validação

- Cálculos separados da UI em job_timing_domain.js e tool_visual_domain.js; ciclos em ferramental/insert_domain.js.
- Testes de domínio: tempos, repetição, desconhecidos, prioridade da medida, contagem por lote, média, desfazer, migração de histórico legado e persistência.
- Testes no navegador: edição da montagem, persistência, progresso ponderado, lote de seis, virada/troca, CSV, rejeição de quantidades inválidas e Play sem contagem automática.
- Corrigida atualização duplicada ao remover campo numérico focado da tabela. Teste não apresentou erros de página após a correção.
- Regressões passaram: O001–O008, lista consolidada, parser, desenho de cinco páginas, seleção das 12 cavidades no 3D, referências originais Z10/XY/G1, in-process e migração de O004.
- Nove testes Python passaram. Os 16 arquivos originais e suas cópias permanecem com hashes preservados.
- Altura do 3D: 620 / 550 / 390 px nas três resoluções. Em desktop, ocupa mais de 60% da largura da tela. Sem overflow horizontal global. Controles novos com altura mínima de 44 px.
- Contraste dos elementos operacionais testados acima de 4,5:1; teclado, arrastar e toque preservados. Monitor físico de fábrica não testado.

Capturas: docs/screens/progress-header-1920.png, progress-tool-1920.png, progress-study-1920.png, progress-history-1920.png e equivalentes 1440/390. Dados dos testes em CNC/Validacao_Progresso_Local.json, Validacao_Insertos_Local.json, Validacao_Inprocess_Local.json e Validacao_Simplificacao_Local.json.
