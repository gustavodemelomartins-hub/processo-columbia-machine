# OS, orientação e montagem de ferramentas

A tela existente foi preservada. A OS 10-713 agora domina o cabeçalho, abaixo do logo; o identificador FP 16F H8 12V permanece apenas nos dados do projeto/desenho. Os três cards vêm depois da OS.

## Conclusão por operação

Cada card apresenta um registro manual **Operação OK**, salvo neste navegador. Marcar esse registro não aprova ferramentas, não preenche o checklist das etapas e não inicia a execução. Alterações de preparação/referência relevantes retiram a conclusão da operação afetada. Apenas navegar não retira a confirmação. A terceira operação segue a confirmar, com registro indisponível até existir definição de processo.

## Orientação e prévia

Conforme orientação do usuário, o primeiro faceamento começa invertido em relação à montagem nos calços. A virada manual leva à posição do segundo faceamento. Na transição para os calços, a peça é apenas elevada, mantendo a mesma orientação. Cavidades, garras, contatos e quatro apoios foram preservados.

A orientação é cadastro de processo em steps[].orientation, vinculado à etapa/programa. Não é inferida do TAP: o programa não descreve o lado físico da peça ou o sentido da montagem.

Play fica disponível mesmo sem liberação operacional e nas etapas manuais que possuem um programa para consulta. Ao montar nos calços, mostra **Prévia: O002.TAP**, enquanto a operação atual continua identificada como montagem manual. Tocar Play não marca execução ou checklist. Sem programa recebido, não há percurso a reproduzir.

## Lista de ferramentas

A referência consultada foi o PDF local 004120.pdf, página 27 de 32, lista da Lima & Bonfá com os campos **Fora pinça** e **Corte útil**. Esse arquivo foi somente consultado; suas ferramentas e medidas não foram transferidas para esta OS. O PDF de referência não foi incorporado à publicação.

Cada ferramenta agora mostra:

- Z mínimo de cada programa e descida máxima, extraídos dos dados CNC existentes.
- Montagem recomendada: descida máxima + 10 mm, quando o cálculo é aplicável.
- Margem adotada por ferramenta, montagem adotada, comprimento fora da pinça medido e diferença entre medida e descida.
- Corte útil separado, com **A confirmar** enquanto a dimensão da ferramenta real não for cadastrada.

O cálculo pressupõe Z0 no topo. Descidas por vários programas da mesma ferramenta aparecem juntas; a recomendação usa a maior descida para preparar a mesma montagem para todo o conjunto.

Exemplo T5: O006/O007 chegam a Z −60 mm. A recomendação é 70 mm. Se o operador adotar 3 mm de margem, a montagem adotada passa a 63 mm; é preciso medir pelo menos 63 mm e marcar Comprimento para a comparação indicar OK. A recomendação de 70 mm permanece visível. Medir 62 mm nessa condição mantém Conferir.

A comparação OK é uma conferência numérica/manual, não uma garantia geométrica contra colisões. Corte útil não é igual à descida Z e não foi deduzido da trajetória. T1 faz faceamento em Z0; a montagem física continua a confirmar, sem recomendação automática de 10 mm de comprimento total.

Alterar medida ou margem retira a confirmação de comprimento e exige nova conferência. Ao abrir esta versão, a política anterior migra para o padrão de 10 mm e retira as confirmações dependentes; medidas e observações são preservadas. Exceções novas ficam salvas por ferramenta. O CSV inclui margem adotada e corte útil cadastrado.

## Arquivos alterados e provas

Fontes: prototype-template.html, operator_markup.html, operator_layer.js, operator.css, operator_process_config.json, package_poc.py. Entregas: Prototipo_Processo_Columbia.html, Cadastro_Processo.json e Fontes_Reproducao_POC.zip. A cópia publicada usa index.html; os TAP não foram editados.

Testes nesta rodada:

- test_mounting_data.py: duas provas de Z/linhas contra TAP original, máximos por ferramenta, orientação e corte útil não inventado.
- test_strategy_data.py: duas provas dos oito programas, 16 estratégias, posições de código e tempo.
- verify_os_mounting.cjs: OS, registro manual/persistência/invalidação, orientação, Play manual, margem de 3 mm, medida insuficiente, migração do padrão e tela móvel.
- verify_operator.cjs: ferramentas, liberação, estados, conferências, desenho e exportação CSV.
- verify_fixtures.cjs: cavidades, posições das garras, quatro apoios e contatos.
- verify_strategy_ui.cjs: estratégias, parâmetros e trechos exatos de código.
- verify_mobile_origin.cjs: pinça por dois pontos de toque emulado, zoom, giro e origem.
- verify-prototype.cjs: desktop 1366 × 768, mouse, desenho e detalhes técnicos.
- Verificação de preservação por SHA256 dos 16 arquivos originais.

QA visual realizado em Chrome automatizado: desktop e tela móvel emulada. Não substitui ensaio físico da montagem/ferramenta na máquina real.
