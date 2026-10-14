# Método de trabalho — Processo Columbia Machine

Documento vivo. Resume como o Gustavo (responsável pelo projeto) e o Claude trabalham juntos. Atualizar quando uma decisão nova for confirmada. Criado em 14/10/2026 a partir da diretriz principal de 14/10, das rodadas de 13/10 (sessão Claude Code), do histórico Git (10–13/10) e dos documentos em `docs/`.

Legenda de evidência: **[C]** confirmado pelo Gustavo (fonte e data); **[H]** hipótese do Claude, ainda não confirmada.

## 1. Papéis

- [C 14/10] Gustavo traz o conhecimento do processo, os arquivos, as observações e a direção do produto. O Claude organiza, analisa, questiona quando necessário, propõe, implementa e valida.
- [C 14/10] Conversa natural em português do Brasil. Uma ideia informal, uma foto, um desenho ou um TAP já é uma entrada válida; não exigir especificação técnica.
- [C 14/10] Perguntar só quando a resposta muda uma decisão de engenharia. Perguntas diretas, agrupadas por assunto.

## 2. Como o Gustavo comunica (observado)

- [C 13/10] Pede **rodadas** numeradas e delimitadas ("Nova rodada de refinamento", "rodada de simplificação"), com o que mudar, o que **preservar** e como validar no fim. Cada rodada é ajuste pequeno, não reconstrução.
- [C 13/10] Explica com **exemplos numéricos concretos** (111,00 − 95,75 = 15,25 mm; redução 0,7 mm por passe; "Aresta 1 · 8 passes · 5,6 mm removidos"). Os exemplos viram casos de teste.
- [C 13/10] Envia **capturas de tela de página inteira** (largura 1440) como referência do estado atual e do problema.
- [C 13/10] Dá nome aos conceitos de produto ("Como fazer", "Vida do insert", "Retorno pós-TT") — usar exatamente esses nomes na interface.
- [C 13/10] Raciocina a partir do operador na máquina: "o que eu vou fazer, como a peça fica montada, qual programa, qual ferramenta, quanto retirar, quantos passes, quanto tempo, o que faço depois".
- [C 13/10] Responde confirmações curtas ("sim"). Não precisa de mensagens longas de volta.

## 3. O que ele costuma corrigir (erros a evitar)

| Erro já cometido | Correção pedida | Fonte |
|---|---|---|
| Transformar uma diretriz ampla em muita interface (roteiro de 8 seções, perguntas de descoberta na tela, etapas de Controle, confirmação de responsável, estados "a confirmar") | Remover tudo; operador não alimenta ERP nem responde questionário | rodada de 13/10 após o commit 5fd64b1 |
| Fonte IBM Plex, caixa alta, mono, microbadges, muitos boxes e alertas ("aparência de interface gerada por IA") | Fonte do sistema (Segoe UI), rótulos em caixa normal, visual industrial simples | 13/10 |
| Alerta de divergência 96,0 × 95,75 e pedido de confirmação | 95,75 é a verdade desta peça; sem alerta | 13/10 |
| Ações contraditórias (Próxima etapa + Iniciar etapa) | Uma única ação principal por estado | 13/10 |
| Tratamento térmico entre 1ª e 2ª operação | TT vem depois da 3ª operação | 13/10 |
| Marcadores X0/Y0/Z0 grandes cobrindo a peça; coluna lateral apertada com painéis técnicos | Eixos discretos; coluna direita só "Como fazer"; técnica em abas abaixo do 3D | 13/10 |
| Inferir dados físicos (corte útil a partir do Z, comprimento de cabeçote) | Dado desconhecido fica `null`; medida real tem prioridade | rodadas de 10/10 |

Padrão por trás das correções [H]: quando a diretriz é ampla, ele quer a **intenção** implementada da forma mais leve possível. Recursos novos entram como opcionais e discretos, nunca como formulário obrigatório.

## 4. Princípios de engenharia (não inventar)

- [C 14/10] Separar sempre: **extraído** de arquivo · **confirmado** pelo Gustavo · **derivado** por cálculo · **sugestão** não aprovada · **pendente**.
- [C 14/10] Não inventar tempos, dimensões, tolerâncias, velocidades, avanços, estratégias, comprimentos de ferramenta ou sequências.
- [C 14/10] Inconsistência: mostrar os valores, as fontes e o impacto. Nunca corrigir em silêncio.
- [C 13/10 e 14/10] 95,75 mm antes do T.T. vale **só para esta peça** (OS 10-713). Não generalizar.
- [C 14/10] Estratégia de sobremetal é por caso (limpar uma face e fechar na outra, ou dividir). Padrão desta peça: Face A limpa 0,20 mm editável, Face B fecha [C 13/10].
- [C 14/10] Medições durante a produção são opcionais e nunca bloqueiam o fluxo.
- [C 13/10] Tempos do TAP + 20% e preparação ~45 min são estimativas; sem dado, mostrar que o tempo não foi informado.
- [C 13/10] Propostas in-process de O005/O007 continuam como propostas. TAPs nunca são alterados.
- [C 14/10] A 3ª operação fica indefinida até haver informação suficiente. Não definir o processo inteiro antecipadamente.

## 5. Regras para material novo (programas, desenhos, fotos)

1. Guardar o original sem alteração e registrar SHA-256 e origem (procedimento em `data/cnc/recebidos/README.md`).
2. Extrair o que o arquivo comprova, com a linha de origem (`python scripts/ficha_programa.py <lote>`).
3. Relacionar com desenho, ferramenta, operação e etapa **somente com evidência**. A numeração do arquivo não prova a sequência de fabricação [C 14/10]. Na dúvida, o vínculo fica pendente.
4. Comparar com `data/process.json` e com a matriz `docs/rastreabilidade/MATRIZ_PROGRAMAS.md`; registrar divergências com valores e fontes.
5. Registrar limitações (arquivo incompleto, ilegível, dado que não se confirma).
6. Só então atualizar o cadastro, com ID novo (nunca renumerar) e build/testes.
7. Não tratar cada arquivo como tarefa isolada: um lote recebido é analisado em conjunto [C 14/10].

## 6. Forma de implementar

- [C 14/10] Incremental. Antes: examinar a implementação, arquivos afetados e impactos. Abordagem simples.
- [C CLAUDE.md] Dados separados da interface; `data/process.json` é a fonte única; `index.html` é gerado; nada de reconstruir o app.
- [C 13/10] Preservar o que já funciona: 3D (protagonista), cálculo de sobremetal e passes, tempos, "Como fazer", ação única, vida do insert.
- [C 14/10] Prioridade de tela: desktop e tablet industrial; celular continua verificado.
- [C 14/10] Interface industrial moderna e precisa; o Design System vive em `design/tokens.json` (fonte única).
- [H] Ele aprecia ver o resultado em capturas antes/depois na resolução que enviou (1440 de largura).

## 7. Critérios de qualidade e publicação

- [C 14/10 e CLAUDE.md] Depois de editar: `npm run build`, `npm run check`, `npm test`; conferir no navegador (3D, desenho, mobile), hashes dos originais e fontes L/N.
- [C 14/10] Nunca afirmar que algo foi testado, publicado ou corrigido sem ter verificado.
- [C README] Publicar só no Pages existente (`main`, raiz), por push fast-forward, depois da validação.
- [H] Mudanças grandes vão para branch e PR em rascunho; o Gustavo decide quando entra em `main`, porque `main` publica o site.

## 8. Onde fica cada registro

| Registro | Arquivo |
|---|---|
| Decisões confirmadas e perguntas pendentes | `docs/informacoes-a-confirmar.md` |
| Informações extraídas dos programas | `docs/rastreabilidade/MATRIZ_PROGRAMAS.md` + fichas em `data/cnc/recebidos/<lote>/fichas/` |
| Melhorias planejadas (ideias, não requisitos) | `docs/backlog.md` |
| Funcionalidades implementadas | `README.md` e histórico Git |
| Testes e validações | `docs/validacao/` e mensagens de commit |
| Modelo do processo | `docs/modelo-processo.md` |

Uma ideia futura só vira requisito quando o Gustavo confirmar [C 14/10].
