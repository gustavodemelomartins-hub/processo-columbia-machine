# Auditoria UI antes — Processo Columbia Machine

2026-10-10. Versão bd7829c, HTML/CSS/JavaScript, Three.js e @sienci/gviewer. Avaliação local da aplicação real em Chromium, O003.TAP/Desbaste, capturas 1920×1080 e 1440×900 antes de editar.

Skills instaladas: UI UX Pro Max e UI Audit. Frontend-design disponível. UI Audit avaliada/adaptada ao Codex: dependências funcionais disponíveis, sem modificar configuração do Claude Code; relatórios em docs conforme pedido. Skills passam a aparecer no catálogo nas próximas interações. Fonte das skills: nextlevelbuilder/ui-ux-pro-max-skill e scottkw/ui-audit-skill.

Consultas Pro Max: contraste/legibilidade e Three.js resize/câmera. Recomendações aplicáveis: contraste ≥4,5:1 para texto comum, foco visível, alvos consistentes, labels, ResizeObserver/camera.aspect. Design-system genérico retornou Hero/CTA; tentativa mais específica retornou storytelling/motion. Ambos rejeitados. Preservar azul Columbia, sistema tipográfico local e funcionamento offline. Sem fontes remotas ou animações decorativas.

| ID | Achado | Prioridade | Ação autorizada |
|---|---|---|---|
| 01 | 3D 679×410 em 1920, aproximadamente 36% da largura; começa em y641 | Alta | Vista dominante 60–70% e maior altura |
| 02 | Coluna de programa rouba largura e duplica dados da ferramenta | Alta | Parâmetros na ferramenta atual; estratégias em consulta técnica |
| 03 | Lateral contém oito ferramentas mesmo em O003/T3 | Alta | Lateral só ferramentas do programa; consolidado abaixo |
| 04 | Passos de 13 px em duas colunas antes do 3D | Alta | Passos numerados em uma coluna abaixo, 19 px |
| 05 | Montagem e recomendação duplicadas com decimais 109,97 | Alta | Uma regra; descida exata separada da recomendação inteira por excesso |
| 06 | Checkboxes de 14–15 px e botões pequenos | Alta | Alvos de 44 px nos controles operacionais; checks 22 px com labels amplos |
| 07 | Programa/identidade/ferramenta repetidos no cabeçalho, programa e lista | Média | Programa principal no cabeçalho; identidade/parâmetros no painel |
| 08 | Origem da engenharia repetida em X, Y, Z e parágrafo | Média | Uma indicação de procedência; confirmações por eixo mantidas |
| 09 | Auxiliares de 9–11 px competem com informação essencial | Alta | Texto operacional ≥16 px; retirar auxiliares repetidos |
| 10 | Containers e bordas de três painéis reforçam densidade | Média | Duas regiões operacionais, divisórias funcionais |
| 11 | Play fora da área visível inferior em 1080 | Alta | Barra de controles legível; 3D no alto |
| 12 | Regra de margem/recomendação repetida em componentes | Alta | Domínio único, valor exato preservado e evidência de Z resolvido |

Não observados: overflow horizontal nesses tamanhos, quebra de parser, falha de zoom/desenho. Interação por toque, estado, fases e dados reais devem ser preservados. Sem validação física de monitor distante ou aparelho nesta auditoria; inspeção visual e métricas de navegador não substituem ensaio no posto de trabalho.

Capturas: outputs/docs/screens/ui-before-1920.png e ui-before-1440.png; completas com sufixo -full. Métricas: outputs/docs/ui-before-metrics.json.

Direção: procedimento CNC industrial; azul #0066B3, navy #0A3250, superfície clara #F3F3F5, texto #0A3250, estados #1B7050 / #87591E; Segoe/system sem dependência de rede. Desktop prioritário, scroll vertical intencional. Hierarquia: Desbaste/programa/status → montagem 3D dominante + T3/medidas/parâmetros → passos/referência → preparação completa. Alterar UI e regra de montagem solicitada, sem refazer motor CNC.
