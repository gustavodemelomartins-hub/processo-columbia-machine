# Briefing independente — refinamento visual no Claude / Cloud Design

Objetivo: refinar o protótipo industrial Columbia da OS 10-713, sem reconstruir o aplicativo. Trabalhar no checkout oficial Processo Columbia Machine/software. Público: operador, processista e programador da Columbia. Preservar identidade azul/branco Columbia e informação legível no ambiente industrial.

A entrega técnica tem app/, data/, assets/, vendor/, tests/, scripts/ e documentação. Editar fontes de app/, gerar index.html com npm run build. Dados e regras não pertencem ao trabalho visual. Uma peça e uma Mini Portal, sem rede/login/seletor de máquinas.

Priorizar hierarquia: operação → etapas → programa/instruções/referências → ferramenta → 3D/desenho. Melhorar densidade, alinhamento, espaçamento, contraste, estados selecionado/em execução/concluído/pendente, foco por teclado e alvos de toque. Manter o 3D grande, zoom/origem, desenho de 5 páginas e PDF original acessíveis. Em celular, organizar a sequência vertical sem rolagem horizontal; reduzir ruído visual sem ocultar instruções importantes.

Obrigatório preservar: duas faces O001; sete etapas O002–O008, O004 único com T12/T4; navegação e status manual; X/Y/Z; Descida máxima no programa e Montagem recomendada como conceitos separados; tabela e lateral com os mesmos valores físicos; fotos reais locais; medida/diâmetro/corretor; tempos por passe, sobremetal e +20%; insertos e fontes L/N/hash; propostas in-process; terceira operação A confirmar; aviso real da divergência 96/95,75. Não voltar ao checklist/preparação antigo.

Consultar docs/arquitetura.md e CLAUDE.md antes de editar. Não mudar IDs, chave de localStorage, parser, TAPs, fontes industriais nem assumir parâmetros físicos. Play/navegar não registram produção. Não cadastrar fotos/medidas fictícias. Não transformar a ilustração em promessa de validação de colisão.

Entregáveis visuais: alterações incrementais nas fontes existentes, rationale curto das decisões e capturas em 1920×1080, 1440×900, 768×1024 e 390×844. Validar npm run build, npm run check, npm test, navegação/3D/desenho, ausência de erro/overflow e compatibilidade de registros já salvos. Não publicar uma nova URL; manter o Pages existente após validação.
