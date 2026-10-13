# Ferramentas do trabalho — corretor, andamento e fotos

Revisão local do protótipo existente. Regra da Mini Portal confirmada pelo operador: diferença de raio.

## Sugestão de corretor

Cálculo: (diâmetro real − diâmetro nominal do TAP) ÷ 2. Ø25 → Ø23,5 resulta em −0,75 mm. Diâmetro nominal e programas originais são preservados.

A tabela mostra “Usar −0,75 mm”; o operador decide preencher o campo e conferir na máquina. Digitar o diâmetro real não substitui um corretor existente. A aceitação salva origem, diâmetro nominal/real, valor, programas e data. Alteração posterior da medida mostra “Medida mudou · revisar corretor”. Edição manual do corretor preserva a liberdade de ajuste e remove a atribuição à sugestão anterior.

O botão aparece somente para ferramentas chamadas em trechos com G41/G42, extraídos dos dados atuais. Ferramentas sem compensação lateral no TAP mantêm o campo manual e recebem essa indicação, sem botão de aplicação. O005/T8 e O007/T6 usam essa compensação; T3 em O003 não recebe sugestão aplicável. O valor é uma sugestão inicial, e a calibração in-process e conferência na máquina continuam necessárias. O protótipo não altera o CNC nem os TAP.

A distinção entre registro por raio e por diâmetro existe em comandos CNC: ver [documentação oficial Haas, Setting 40](https://www.haascnc.com/service/codes-settings.type%3Dsetting.machine%3Dmill.value%3DS40.html). Essa referência serve à distinção conceitual; a regra configurada da Mini Portal vem da confirmação do operador neste trabalho.

## Andamento do ferramental

Resumo com quantidade de ferramentas marcadas simultaneamente Montada e Na máquina, e indicação da próxima etapa pendente depois da etapa selecionada. Cada linha indica Programa atual, Próxima etapa, Mais adiante, Etapa anterior ou Uso concluído, conforme as etapas do processo e registros manuais.

As barras nas linhas representam os dois itens físicos: Montada e Na máquina. Texto indica Montar, Levar à máquina, Montada · na máquina ou Conferir montagem. Marcar Na máquina sem Montada não completa a barra geral. Esses estados informam situação de montagem, sem declarar a montagem tecnicamente liberada.

Conclusão de etapa continua independente das marcações físicas. Não existe avanço automático por Play ou por tempo decorrido. O004 segue uma etapa com T12/T4; T4 também aparece em O008. A mesma fonte de estado atende tabela e painel da ferramenta atual.

## Fotos de montagens reais

Botão Foto abre detalhe e permite anexar, substituir e remover uma foto escolhida pelo operador. Cada foto pertence à combinação máquina + ferramenta; nenhuma imagem da internet é usada ou pré-carregada. Miniatura na tabela e no painel lateral lê o mesmo registro.

JPG, PNG e WebP, até 12 MB de entrada. A aplicação reduz a imagem para no máximo 768 px no maior lado e a salva em JPEG, com limite de 250 mil caracteres codificados por foto. Arquivo original não é alterado. Fotos e campos ficam neste navegador; o HTML e o CSV de ferramentas não embutem as fotos salvas pelo operador. Se o armazenamento falhar, a foto anterior é preservada e a interface informa a falha.

## Validação

- Domínio: cálculo negativo/zero/positivo, ausência de medida, valores inválidos, regra desconhecida, ausência de G41/G42, estados físicos e ordem de uso.
- Navegador: exemplo Ø25/23,5; botão explícito; corretor anterior preservado; alteração da medida detectada; recarga; estado canônico na lateral; próxima etapa; ferramenta usada em dois programas.
- Fotos: upload, compressão, isolamento por máquina, miniaturas compartilhadas, recarga, rejeição de SVG, remoção e preservação da foto anterior se o armazenamento falhar.
- Falha de armazenamento do corretor também restaura o valor anterior e sua conferência arquivada.
- Diálogo via teclado: Escape e retorno do foco ao botão de origem. Controles novos com pelo menos 44 px de altura.
- Capturas e inspeção visual em 1920×1080, 1440×900 e 390×844. Sem overflow horizontal da página; a tabela mantém rolagem horizontal própria nas telas estreitas. 3D preservado em 620/550/390 px.
- Regressões passaram: O001–O008, parser, ferramentas e medidas, desenhos, in-process, contador de insertos, consulta de cavidades, tempos e progresso. Nove testes Python passaram; os 16 arquivos originais permaneceram preservados.

As imagens em tool-work-photo-* e miniaturas das capturas são fixtures sintéticas de teste, identificadas como Foto_teste.png; não representam uma ferramenta real da Columbia. Os diâmetros e marcações dessas capturas também pertencem ao cenário de teste. A aplicação entregue inicia sem essas fotos ou valores de teste.

Capturas: docs/screens/tool-work-table-full-1920.png, tool-work-suggestion-1920.png e equivalentes 1440/390; tool-work-photo-* e tool-work-sidebar-*. Relatório: CNC/Validacao_Ferramentas_Andamento_Local.json.
