# Fluxo de etapas — revisão operacional

## Antes

As etapas ficavam dentro de um seletor. Era preciso abri-lo para enxergar o que vinha depois; não havia leitura do progresso de cada fase junto às operações.

## Depois

Os três cards de operação foram preservados. Logo abaixo aparecem todos os boxes da operação selecionada, em ordem, com número, programa, descrição e estado. O seletor foi substituído pelos boxes; Anterior/Próxima etapa continuam disponíveis.

- Primeira operação: dois faceamentos usando O001.TAP. A virada permanece na instrução do segundo lado.
- Segunda operação: montagem manual e oito etapas dos programas O002–O008. As duas etapas de O004 continuam separadas.
- Terceira operação: etapas e programas a confirmar, sem conteúdo inventado.

Azul identifica a etapa atual. Verde e “✓ Concluída” identificam execução registrada. O contador mostra quantas etapas daquela operação foram concluídas. Visitar ou simular não conclui uma etapa; o registro usa a conferência existente. Mudança de comprimento invalida a conclusão associada. O check-in manual da operação inteira permanece separado.

Clicar em um box atualiza o mesmo programa, instruções, montagem 3D e ferramentas do programa. Navegação e Play continuam livres. Registros permanecem neste navegador.

## Inspeção visual

Capturas locais antes/depois e inspeção em 1920×1080, 1440×900 e 390×844. Boxes legíveis, sem overflow horizontal; foco de teclado preservado. 3D com 620 px de altura em 1920 e 550 px em 1440, ocupando aproximadamente 64%/62% da largura total. A área visual continua grande e é acessada com rolagem vertical. Monitor físico da fábrica não avaliado.

Capturas: `screens/stage-flow-first-1920.png`, `screens/stage-flow-second-1920.png`, `screens/stage-flow-second-1440.png`, `screens/stage-flow-second-390.png`, `screens/stage-flow-process-1920.png`. Arquivos locais, fora da publicação pública.

## Validação

Novo fluxo: boxes, sequência O001–O008, programas com múltiplas ferramentas, montagem manual, conclusão, persistência, invalidação de medida, navegação sem liberação, teclado e operação ainda não definida. Resultado em `CNC/Validacao_Fluxo_Etapas.json`.

Regressões existentes: processo operacional, dimensões e fixação 3D, ferramental, desenho, referências, estratégias/linhas CNC, domínio de comprimentos, estado e responsividade. Resultado consolidado em `CNC/Validacao_Regressoes_Fluxo.json`. Também passaram os sete testes Python de parser/CNC, estratégias e montagem.

## Arquivos

`work/operator_layer.js`, `work/operator_markup.html`, `work/prototype-template.html`, `work/industrial.css` e testes de navegação existentes. Novo `work/verify_stage_flow.cjs`; empacotamento atualizado em `work/package_poc.py`. HTML regenerado em `Prototipo_Processo_Columbia.html`; fontes no pacote `Fontes_Reproducao_POC.zip`. Parser, TAPs e cadastro do processo preservados.
