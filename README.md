# Processo Columbia Machine

Protótipo industrial existente da OS 10-713, peça FP16F H8 12V, na **Mini Portal**. Processo, desenho, 3D, programas O001–O008 e ferramental funcionam localmente. Esta revisão contém as fontes completas usadas para gerar `index.html`.

## Abrir e usar

Abra `index.html` no navegador. Escolha a operação e a etapa. A primeira operação tem duas faces com O001. A segunda tem sete etapas, O002 até O008; **O004 é uma etapa com T12 e T4**. A terceira permanece a confirmar.

**Iniciar etapa** registra “Em execução”. A caixa **Concluída** registra o término. Desmarcar a conclusão retorna a etapa a “Não iniciada”. Navegar, consultar o desenho e usar Play não registram produção. Os tempos previstos incluem 20% e o progresso acompanha apenas etapas concluídas, ponderadas pelo tempo. No faceamento, o tempo do TAP corresponde a um passe. Informe o sobremetal a retirar em cada face; o sistema calcula `ceil(sobremetal / redução por passe)`. A redução padrão, confirmada pelo operador, é 0,7 mm e pode ser editada. Os tempos de cada face, da operação e da peça consideram esses passes. Sem sobremetal informado, o total fica A definir e o progresso mostra a quantidade de etapas concluídas. A terceira operação ainda não entra no total.

Os registros, fotos e medidas ficam no navegador. Git versiona a aplicação, não os registros pessoais do operador. Abrir por outro endereço ou dispositivo pode usar outro armazenamento.

## Ferramentas e processo

- T e descrição em colunas separadas; tabela e lateral compartilham medidas, diâmetro real, corretor, Montada e Na máquina.
- Ø25 nominal e Ø23,5 real sugerem **−0,75 mm**, diferença de raio confirmada para a Mini Portal. O botão Usar preenche o corretor mediante ação do operador; a sugestão depende da compensação lateral no TAP. Mudar a medida exige revisar o valor aplicado.
- Uso atual/próxima etapa e situação física acompanham o processo. Fotos reais podem ser anexadas, substituídas e removidas por máquina/ferramenta.
- Descida máxima extraída do TAP e montagem recomendada são conceitos separados. 99,97 + 10 → 110 mm, arredondando para cima. T1 exibe limite operacional de faceamento 1 mm, separado do Z nominal 0 do TAP.
- O003: estudo manual de cavidades por virada/troca de insertos, histórico, média, desfazer e CSV. Consulta por cavidade mostra as linhas originais L/N; selecionar e simular não contam desgaste.
- O005/O007: propostas de in-process para calibrar a primeira cavidade com sobremetal e depois concluir na medida do desenho. Os TAPs originais permanecem intactos. Cotas/tolerâncias finais vêm do desenho, não de um alvo fixo inventado.
- T9: representação com corte 30 mm e montagem visual de referência 40 mm; a montagem medida tem prioridade. Representação não equivale a medição física.

Mini Portal permanece isolada dos perfis Portal 1/2. Capacidade do magazine e posições físicas desconhecidas continuam nulas. Os modelos de ferramental estão preservados; o fluxo atual usa a lista simples, conforme as revisões do operador.

## Editar e gerar

Requisitos: Python 3.11+ e Node.js 22+. As versões de Pillow e Playwright abaixo são as usadas nesta validação.

```sh
python -m pip install -r requirements.txt
npm install
npx playwright install chromium
python scripts/build.py
```

O build pode ser chamado de qualquer pasta. Ele lê `src/`, gera `index.html`, atualiza Cadastro_Processo.json, MachineProfiles.json e os derivados de estratégias/cavidades. Para mudar o comportamento, edite as fontes e execute o build; editar apenas um JSON ao lado do HTML não altera os dados incorporados.

```sh
npm run test:unit
npm test
python scripts/check_originals.py
python scripts/test_parser.py
```

Os testes de navegador abrem o HTML local e verificam fluxo, persistência, ferramentas, fotos, corretor, insertos, cálculos, desenho e 3D em 1920×1080, 1440×900 e 390×844. A suíte de faceamento também verifica passes fracionários, totais desconhecidos, edição, persistência e conclusão preservada. Resultados e capturas novos ficam em `artifacts/`, ignorado pelo Git. Evidências desta entrega estão em [docs/Entrega_2026-10-12.md](docs/Entrega_2026-10-12.md).

Em ambientes com navegador instalado fora do padrão, `COLUMBIA_CHROMIUM_PATH` escolhe o executável; `COLUMBIA_PLAYWRIGHT_MODULE` escolhe um módulo Playwright já instalado. Não são necessários no uso normal com npm.

## Onde alterar

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| src/prototype-template.html | Estrutura existente, 3D, integração com percurso CNC |
| src/operator_layer.js | Etapas, referências, instruções e status manual |
| src/operator_process_config.json | Cadastro do processo, margens, referências e propostas |
| src/tool_*_domain.js | Regras de descida, representação e corretor/uso |
| src/job_timing_* | Previsão e progresso por tempo |
| src/ferramental/ | Perfis, atribuições, tabela, fotos e domínio de insertos |
| src/strategy_ui.js e insert_ui.js | Detalhes técnicos, estratégias, cavidades e desgaste |
| src/strategy_data.json, cavity_data.json e cnc_payload.b64 | Dados derivados do TAP usados pelo build |
| CNC/originais/ | O001–O008 imutáveis e inventário SHA-256 |
| Desenhos/ | PDF original de cinco páginas |
| scripts/ e vendor/easy_gcode_plot/ | Build, validação e snapshot do parser existente |

Para revisar o parser, `scripts/cnc_adapter.py` usa os TAPs em CNC/originais e gera os relatórios/percurso. `scripts/build_strategy_data.py` e `scripts/build_cavity_data.py` regeneram derivados a partir desses relatórios. Essa é uma etapa de engenharia separada do build de interface; valide os dados gerados antes de aceitar mudanças no percurso.

Three.js, @sienci/gviewer e easy_gcode_plot têm atribuições em Licencas/. O parser foi preservado no snapshot 98894b34fb80cc73f12c0ebf3a69e9baca7448f2. Logo, desenho e arquivos CNC da Columbia não recebem licença aberta por esta entrega.
