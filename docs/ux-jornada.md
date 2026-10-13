# Auditoria de UX e decisões — rodada Jornada da OS

## Antes

- Página longa de informações: cabeçalho de tempos, três cartões de operação, cartões de etapa, título, instruções, referência, 3D, ferramenta e tabela, todos com o mesmo peso visual.
- Não havia início do processo: a peça "aparecia" já na primeira face; espessura recebida e sobremetal só existiam num formulário legado oculto.
- O operador precisava ler ~30 informações para saber o que fazer; "Onde estou" dependia de achar o cartão azul.
- Tratamento térmico e controles entre operações não apareciam; a 3ª operação era só um cartão cinza.
- Tempos apenas planejados; nenhum registro de início/fim.
- 3D sem relação com o que a pessoa estava lendo.
- Pendências de engenharia espalhadas em textos de aviso.

## Depois

1. **Cabeçalho permanente da OS**: OS, peça, máquina, etapa atual (clicável), progresso em segmentos (x de 12), tempo restante, status geral e contador de pendências.
2. **Mapa da jornada**: Recebimento → 1ª operação → Controle → Tratamento (sequência a confirmar) → 2ª operação → Controle → 3ª operação (não definida). Os botões de operação existentes foram mantidos e incorporados ao mapa.
3. **Recebimento e medição inicial**: espessura recebida, dois objetivos lado a lado (96,0 processo × 95,75 desenho) com cálculo de sobremetal para cada um, confirmação humana com responsável, seção esquemática da peça (Face A / material / peça final / material / Face B) com referência simétrica ou método do processo, e ação explícita para levar a referência ao tempo previsto.
4. **Etapa atual**: contexto em caixa alta, título, objetivo da etapa, programa em mono, status, ação principal (Iniciar → Concluir) e bloco de tempo (estimado, preparação não informada, início, decorrido/real).
5. **Roteiro em 8 seções** com "Agora: …" e "Conferir antes de continuar". Seções com lacunas mostram `?`.
6. **3D contextual**: Fixação destaca calços e garras; Referenciamento mostra eixos X0/Y0/Z0 rotulados; Preparação de faceamento mostra a camada de sobremetal; Ferramentas posiciona a ferramenta; legenda de contexto e selo de não certificação.
7. **Conclusão → próxima etapa** destacada (contorno tracejado no cartão e faixa com botão); ao fim da operação, a faixa aponta o controle.
8. **Controles** com medida, Δ para cada objetivo, critério a confirmar e liberação manual registrada.
9. **Passaporte da peça** e **Informações a confirmar** (16 perguntas estruturadas) no fim da página; passaporte exportável em JSON.

## Preservado

Duas faces O001; sete etapas O002–O008 com O004 único (T12/T4); IDs e chave de armazenamento; Play/navegação sem registro; tabela de ferramentas, fotos, diâmetro/corretor, insertos, in-process, estratégias L/N, desenho de 5 páginas; tempos +20% e faceamento por passes; aviso 96/95,75; terceira operação indefinida; checklist antigo não voltou (a lista "Conferir antes de continuar" é orientação, não caixa de seleção).

## Larguras validadas

1920×1080, 1440×900, 1024×768, 768×1024 e 390×844 sem rolagem horizontal; capturas em `artifacts/screens/journey-*`.
