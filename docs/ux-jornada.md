# UX da jornada — rodada de simplificação da V1

## Problema da rodada anterior

Tela carregada e burocrática: fonte IBM Plex com rótulos em caixa alta e mono, roteiro de 8 seções, alerta de divergência 96,0 × 95,75, confirmação com nome do responsável, 16 perguntas de descoberta na tela, etapas de Controle sem critério, ações duplicadas (Iniciar etapa + Próxima etapa + caixa Concluída) e estados "a confirmar" espalhados.

## Agora

1. **Tipografia da versão anterior** (Segoe UI / fonte do sistema), rótulos em caixa normal, sem mono na interface.
2. **Cabeçalho da OS**: OS, peça, máquina, etapa atual, progresso (x de 10) e usinagem restante estimada.
3. **Mapa**: Recebimento → 1ª → 2ª → 3ª operação → Tratamento térmico → Retorno pós-TT. Estado só por ícone (✓, número azul).
4. **Recebimento**: espessura recebida → 95,75 mm → sobremetal total; Face A apenas limpa (0,20 mm, editável) e Face B fecha a espessura, recalculada na hora. Esquema bruto → sobremetal → peça final. "Dividir igualmente" é opção secundária.
5. **Painel da etapa**: nome, objetivo, uma ação principal, programa, ferramenta, sobremetal, redução por passe, passes estimados, usinagem estimada (TAP + 20%) e preparação estimada (~45 min).
6. **3D em destaque** (≥ 60% da largura no desktop) com legenda de contexto: face trabalhada em laranja, orientação, calços/garras, origem.
7. **Como fazer** sozinho ao lado do 3D (coluna de 360 px; 3D com 600 px de altura em 1440), com "Ver detalhes da operação" recolhido (posição, montagem, garras, alinhamento, referência, estratégias, proposta in-process, desenho).
8. **Seção técnica abaixo do 3D**, largura total, em abas: Ferramenta | Vida do insert | Programa/TAP (estratégias, chamadas, consulta de cavidades, propostas) | Histórico (registro da peça).
9. **Vida do insert em um clique** no painel da etapa: passes por aresta no faceamento, cavidades por aresta no O003; virar/trocar fecha a aresta. Opcional.
10. **Origem no 3D discreta**: eixos finos e curtos, setas pequenas, letras X/Y/Z pequenas sem caixa.
11. **Sem** perguntas, controles, inspeção formal, alertas amarelos ou confirmações obrigatórias.
12. Arquivos técnicos recolhidos no fim da página.

## Preservado

Duas faces O001; O002–O008 com O004 único (T12/T4); ordem 1 → 8; IDs e chave de armazenamento; Play/navegação sem registro; tabela de ferramentas, fotos, diâmetro/corretor, insertos, estratégias L/N, propostas in-process O005/O007, desenho de 5 páginas; faceamento por passes (0,7 mm editável).

## Larguras validadas

1920×1080, 1440×900, 1024×768, 768×1024 e 390×844 sem rolagem horizontal; capturas em `artifacts/screens/journey-*`.
