# Processo Columbia Machine

## Problema e objetivo

Programas CNC, desenho, fixação, ferramentas, sobremetal e tempos de uma peça ficam em arquivos e conhecimentos separados. O protótipo reúne e padroniza esse processo para um caso real, a OS 10-713 (FP 16F H8 12V) na Mini Portal, mostrando ao operador, em cada etapa, o que fazer, como a peça fica montada, qual programa e ferramenta, quanto retirar, quantos passes, quanto tempo e o que vem depois.

## Público e papéis

- Operador da Mini Portal, no chão de fábrica: desktop e tablet industrial primeiro; celular continua verificado.
- Gustavo, responsável pelo projeto: traz o conhecimento do processo, os programas, desenhos e fotos, e decide o que vira requisito.
- Programador e processista: fornecem os programas; no futuro, revisam o processo gerado.

Não há login nem papéis na V1; os registros são locais e anônimos.

## Fluxos da V1

1. **Recebimento:** o operador informa a espessura recebida; o sistema calcula o sobremetal até 95,75 mm (Face A apenas limpa 0,20 mm, editável; Face B fecha).
2. **Operações:** 1ª operação (duas faces, O001), 2ª operação (O002–O0017) e 3ª operação na mesa (O0018–O0021), cada etapa com 3D, "Como fazer", programa, ferramenta, passes e tempos estimados, e uma única ação principal (Iniciar operação → Concluir operação → Ir para próxima etapa).
3. **Tratamento térmico** (externo) e **Retorno pós-TT** (em levantamento).
4. **Apoio opcional:** vida do insert em um clique, diâmetro real e corretor, fotos de montagem, consulta de cavidades no TAP e no desenho.

Detalhes do modelo: [docs/modelo-processo.md](docs/modelo-processo.md) e [docs/ux-jornada.md](docs/ux-jornada.md).

## Fora de escopo na V1

Rede, backend, autenticação, conexão com o CNC, múltiplas máquinas, integração com ERP, inspeção formal e questionários ao operador. Tolerâncias, colisões e liberação do processo para a máquina continuam com a engenharia: o 3D é orientativo.

## Requisitos e restrições

- `data/process.json` é a fonte única; os TAPs originais são imutáveis e conferidos por hash.
- Nenhum dado de engenharia é inventado. Dado físico desconhecido fica `null`; tempos do TAP + 20% e preparação ~45 min são estimativas.
- Funciona sem rede: `index.html` autocontido, publicado no GitHub Pages existente.
- Interface em português do Brasil, fonte do sistema, rótulos em caixa normal; alvos de toque ≥ 44 px.
- Regras completas do domínio: [AGENTS.md](AGENTS.md#regras-do-domínio-não-mudar-sem-decisão-do-gustavo).

## Hipóteses e pendências

Perguntas ao responsável ficam em [docs/informacoes-a-confirmar.md](docs/informacoes-a-confirmar.md). As principais em aberto: retorno pós-TT, cadastro físico da Mini Portal (corte útil, cabeçotes, magazine) e confirmação da ordem O009–O0013.

## Critérios de aceitação

- A jornada completa (recebimento → 3ª operação → T.T. → retorno) funciona em 5 larguras (`tests/browser/verify_journey.cjs`).
- 111,00 mm recebidos geram 15,25 mm de sobremetal: Face A 0,20 mm e Face B 15,05 mm (`tests/unit/test_journey_domain.cjs`).
- Navegar, abrir detalhes e Play não registram execução; a ordem dos programas é respeitada.
- Hashes dos originais conferem e o build reproduz o `index.html` versionado.

## Próxima entrega

Direção informada pelo Gustavo em 14/10/2026, ainda não aprovada como requisito: processo gerado a partir dos programas recebidos, com tela de revisão para posicionar garras no 3D e anotar observações ([docs/backlog.md](docs/backlog.md)).

## Manutenção

Atualizar quando objetivo, escopo, restrições ou critérios mudarem. Decisões técnicas ficam em docs/arquitetura.md; evidências do setup de IA em docs/setup.md.
