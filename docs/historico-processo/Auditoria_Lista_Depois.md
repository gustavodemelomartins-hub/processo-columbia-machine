# Auditoria depois — simplificação operacional

Interface atual revisada no navegador real em 1920×1080, 1440×900 e 390×844. Continuidade da identidade, layout e dados da peça OS 10-713 / Mini Portal.

- Uma tabela principal para montagem medida, diâmetro real, corretor, Montada e Na máquina. A lateral apenas consulta o mesmo registro; ausência aparece como Não informado.
- Retirados da superfície: preparação, magazine, progresso de ferramentas, checklist de etapa, rastreabilidade expansível e rodapés genéricos sob o 3D. Desenho de cinco páginas continua na aba Desenho.
- O002 abre a segunda operação. Montagem manual nos quatro calços está nas instruções. Segundo faceamento mantém virada/orientação e ajuste do corretor até96 mm, sem repetir T1 ou carga do programa.
- Instrução conforme desenho 3D. X/Y continuam no centro definido pela engenharia; preset da ferramenta no topo da peça. Nenhuma origem nova inferida.
- Descida exata e recomendação permanecem distintas: T3 99,97 mm e110 mm. Margem padrão10 mantida no domínio. Diâmetro nominal do TAP separado do diâmetro real informado.
- 3D: 1233×620 px em1920, cerca de64% da região principal; 897×550 px em1440, cerca de62%; 364×390 px no celular. Sem redução para encaixar toda a página.
- Corrigido espaço entre Mini Portal e Ferramentas no cabeçalho. Destaque da ferramenta atual abrange a linha inteira da tabela. Botões/áreas de marcação com44 px, foco visível e navegação por teclado.
- Sem overflow global. No celular, a tabela usa rolagem horizontal local com cabeçalhos preservados; a página continua com rolagem vertical normal.
- Amostras de contraste: Play5,91:1; título/passos13,25:1; recomendação6,87:1; origem7,08:1. Inspeção visual sem clipping de controles ou números nas resoluções principais. Monitor físico/distância real ainda não avaliados.

Validação: verify_simple_workflow.cjs percorre O001–O008, troca do painel, edição/salvamento/reload, valores inválidos, desconhecidos, isolamento da Mini Portal, montagem/diâmetro 3D, conclusão manual, desenho, linhas técnicas e CSV. Mais cinco suites de regressão, prova O001, acessibilidade e sete testes Python. Originais16/16 preservados.

Conclusão de etapa é registro manual no mini box, independente dos dados de ferramenta; visitar ou simular não conclui. Dados antigos arquivados e perfis de máquina continuam preservados. Os testes históricos de preparação/checklist referem-se a requisitos substituídos, não à experiência atual.

Capturas locais em docs/screens: simple-process-1920/1440/390, simple-tools-1920/1440/390 e equivalentes simple-live após publicação. Evidências: CNC/Validacao_Simplificacao_Local.json, CNC/Validacao_Simplificacao.json e CNC/Validacao_Regressoes_Simplificacao.json. Novas capturas ficam somente na entrega local.
