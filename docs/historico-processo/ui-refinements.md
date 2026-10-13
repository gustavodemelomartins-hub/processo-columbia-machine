# Refinamentos operacionais — Processo Columbia Machine

2026-10-10. Continuação da versão 06c02b2, mantendo interface Columbia, motor CNC, trajetória, desenho e registros. Não há alteração de programas TAP.

## Ajustes pedidos

1. Primeira operação tem duas etapas visíveis: primeira face → segundo lado/medição. A virada acontece na instrução do segundo lado. Não há etapa separada Tombar. Orientação invertida na primeira face, um tombamento e mesma posição para subir nos calços preservados. IDs das demais fases não foram renumerados.
2. Margem +10 mm como padrão do processo, em texto. Entrada de margem saiu da área principal. Exceções previamente permitidas continuam em Rastreabilidade e ajustes, fechada por padrão; o cadastro central continua configurável, sem espalhar constante entre componentes.
3. Corte útil desconhecido saiu da tela e do aviso 3D. Não foi deduzido da descida Z. Comprimento de arestas é uma medida física, diferente do percurso. Dado físico já cadastrado/medido é preservado, assim como sua aplicação no modelo 3D; não se apaga informação anterior.
4. Programa/manual foi deslocado para junto do início da região lateral; status separado à direita. Retirados os dois botões de operação: os três cards continuam como navegação principal. Anterior/próxima etapa continuam.
5. Lateral: Ferramenta atual / Detalhes técnicos. Dados e linhas originais do programa atual ali, incluindo trocas M6, estratégias PERCURSO, parâmetros, tempo e links L/N. Todas as estratégias de O007/T5/T6 permanecem, com os trechos originais destacados ao clicar. Linhas não são autorização de retomada.
6. Instruções e referências acima da visualização, abaixo da etapa atual. Passos agrupados sem retirar montagem, alinhamento externo, origem, ferramenta, programa e conferência. Uma coluna, texto 20 px. Checklist e conferência permanecem abaixo da vista, em seção expansível, sem bloquear navegação/Play. Lista consolidada das oito ferramentas abaixo.
7. T1: Montagem padrão no painel e no consolidado, conforme processo informado pelo usuário. Z nominal0 da trajetória mostrado como Z no programa (nominal). Não se inventou um comprimento físico para o cabeçote.

## Comprimentos e rastreabilidade

Descida máxima resolvida e montagem recomendada continuam separadas. T3/O003:99,97 + margem10 →110 mm; valor exato preservado. Recomendação por excesso continua na única regra de domínio. Preparação consolidada considera todos os programas da ferramenta; painel somente o programa atual.

O001 possui aviso real do kernel: M32 não modelado. Por isso a barreira de análise não resolvida não foi removida para gerar uma altura automática. O Z nominal0 é extraído da trajetória, rotulado nominal; Montagem padrão é dado de processo, sem valor numérico presumido. Medida real e conferências continuam necessárias. Corte útil não é calculado como abs(Z).

Dados antigos de fase1 ficam arquivados. Um navegador salvo na virada abre a fase2, conservando medida e observação antiga, sem transformar a conclusão da virada em aprovação do segundo faceamento. As demais fases/medições/inspeções mantêm seus IDs.

Corrigido um problema identificado no teste multiferramenta: o callback de confirmação recebia o índice da lista no argumento de programa. Agora cada ferramenta é conferida no programa atual explicitamente; O007 torna-se pronto quando T5/T6 e a montagem estão efetivamente conferidos, sem depender das ferramentas de outros arquivos.

## QA visual

Capturas da aplicação real em 1920×1080 e 1440×900, topo, região visual, instruções, detalhes de O007 e painel T1. Comparadas com a versão anterior e os comentários do usuário. Vista preservada: aproximadamente66% da largura, 620 px no monitor industrial e550 px em1440. Instruções acima aumentam a rolagem vertical; não se reduziu o 3D para encaixar tudo. Play continua na barra superior da vista.

A primeira inspeção encontrou clipping de Centro da peça em1440. A proporção das instruções/referências foi corrigida e a captura repetida: X/Y legíveis, sem truncamento. Cards técnicos empilhados na lateral para evitar tabela apertada; links de linhas visíveis sem abrir cada estratégia. Sem overflow horizontal1920/1440/390; testes adicionais375/landscape e controles por teclado/pan preservados. Não foi feito ensaio com monitor físico distante ou celular físico.

Contrastes amostrados novamente: Play5,91:1; título/passos13,25:1; recomendação6,87:1; procedência7,08:1. Mantida aplicação das skills instaladas UI UX Pro Max/UI Audit; sem adotar temas ou workflows genéricos.

## Testes

Passaram: verify_operator_refinements (migração, dois faceamentos, painel técnico, fonte exata de T6, prontidão multiferramenta, margem, campos desconhecidos ausentes, checklist e persistência); verify_operator; verify_industrial_ui; verify_strategy_ui; verify_tool_dimensions; verify_mobile_origin; verify_fixtures; verify_program_panel; verify-prototype; test_tool_length_domain. Também sete casos Python de montagem/estratégias/POC/lote CNC e conferência SHA256 dos16 originais. Testes que selecionavam a antiga etapa1 foram adaptados à fase2, mantendo verificações de orientação, geometria e confirmações.

Capturas: outputs/docs/screens/refinements-*.png. Evidências JSON: outputs/CNC/Validacao_Refinamentos_Operacionais.json e demais Validacao_*.json. Verificação do site usa a mesma suíte após publicação; cópia offline com sufixo _Local.

## Arquivos

Alterados: work/operator_markup.html, prototype-template.html, operator_layer.js, industrial.css, strategy_ui.js, operator_process_config.json. Mantidos kernel, payload CNC, biblioteca Three.js, desenho e originais.

Novos: work/verify_operator_refinements.cjs e work/ui-review/refinements_probe.cjs; relatórios, capturas e documentação atualizada. Testes existentes ajustados aos controles/seletores retirados. Builder gera o mesmo HTML independente; Fontes_Reproducao_POC.zip atualizado.
