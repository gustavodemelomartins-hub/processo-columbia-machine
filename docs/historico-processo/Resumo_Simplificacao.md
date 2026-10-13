# Processo Columbia Machine — lista simples

O002 inicia a segunda operação; montagem manual nos calços integrada às instruções. Segundo faceamento: virar/alinhação conforme3D e ajustar corretor até96 mm, sem repetir T1 e carga do programa.

Ferramentas do trabalho: oito ferramentas derivadas dos TAPs. Editar diretamente montagem medida, diâmetro real, corretor, Montada e Na máquina. Painel lateral somente lê os dados da tabela. Campos vazios: Não informado. Diâmetro real não substitui nominal do TAP.

Descida máxima exata separada de montagem recomendada inteira, com margem padrão10. T3:99,97 mm →110 mm. Mini Portal preservada, dados locais no navegador. Nenhuma capacidade ou posição física inventada.

Checklist/preparação/magazine e avisos genéricos retirados da tela. Mini boxes mantêm conclusão manual simples e navegação livre. 3D grande, Play, desenho de cinco páginas e Detalhes técnicos com linhas exatas preservados.

Auditorias: docs/ui-audit-simple-before.md e docs/ui-audit-simple-after.md. Teste atual: CNC/Validacao_Simplificacao_Local.json e equivalente publicado. Screenshots1920×1080,1440×900 e celular ficam em docs/screens.

## Detalhes e insertos — revisão atual

Tempo destacado, contador manual T3 e consulta de cavidades com linhas Z10/XY/G1 reais. AP/AE e rodapés removidos. T/descrição separados. T1: limite de 1 mm no corretor, mantendo Z nominal do TAP em 0 mm. Consulta não identifica parada real nem altera TAP. Auditoria: docs/ui-audit-inserts-after.md.

## Etapas e in-process — revisão atual

O004 unido com T12/T4; sete etapas na segunda operação. Montagem/preset em O002, instruções seguintes específicas. Proposta de calibração de uma cavidade antes das demais em O005/O007, com TAP real preservado. Ver Proposta_Inprocess.md e docs/ui-audit-inprocess-after.md.

## Tempos, T9 e estudo de insertos — 12/10/2026

Cabeçalho com previsão CNC +20%, restante e progresso por tempo das etapas concluídas; tempos por programa e operação. O001 conta nos dois lados; O004 uma vez; terceira operação a definir. Total previsto: 6 h 47 min. T9 ilustrativa com corte de referência de 30 mm e saída de 40 mm; medida real tem prioridade. T3 com quantidade por ciclo, virada/troca, desfazer, histórico, média e CSV. Dados reais de montagem não preenchidos pelo protótipo. Ver docs/ui-audit-progress-after.md e CNC/Validacao_Progresso_Local.json.

## Corretor, andamento e fotos — revisão mais recente

Diferença de raio confirmada pelo operador da Mini Portal: (Ø real − Ø nominal) /2. Ø25 → Ø23,5 sugere −0,75 mm, com botão manual e revisão após mudança de medida. Resumo de ferramentas montadas/na máquina, barras físicas e indicação do próximo programa. Fotos reais anexáveis por máquina/ferramenta, compartilhadas com a lateral e salvas neste navegador. Ver docs/Validacao_Ferramentas_Andamento.md.

## Faceamento por sobremetal — 12/10/2026

Cada face recebe seu sobremetal a retirar; redução padrão 0,7 mm por passe confirmada e editável. Passes arredondam para cima; previsões acompanham as repetições de O001. Sem estimativa válida, total A definir. Registros de conclusão preservados; progresso por quantidade de etapas enquanto o tempo for desconhecido. Validação: docs/Faceamento_2026-10-12.md.
