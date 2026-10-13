# Design System — Columbia Processo

Fonte única: `design/tokens.json` (cores, tipografia, espaçamento, raios, sombras, tamanhos, layout). O build (`scripts/design_tokens.py`) gera as variáveis CSS. Tipografia: fonte do sistema (Segoe UI no Windows), a mesma da versão anterior à reformulação; nenhuma fonte é incorporada. Componentes em `app/design/components.css` (prefixo `ds-`); casca da aplicação em `app/journey/journey.css`.

O mesmo conteúdo está publicado como artefato **Design System "Columbia Processo"** no Claude (tokens, brand book, 16 componentes com prévia e guia, logo). Ao mudar tokens ou componentes aqui, republicar o artefato com os mesmos arquivos.

## Direção

Software industrial simples e natural: superfícies claras, filetes finos, poucos boxes, rótulos em caixa normal, números tabulares, sem mono na interface (só em listagens de código G), azul Columbia só para ação e etapa atual. Sem gradientes, sem emoji, sem alertas decorativos.

## Regras que não podem ser quebradas

- Uma única ação principal por estado (Iniciar operação → Concluir operação → Ir para próxima etapa).
- Nada de perguntas de descoberta, "a confirmar" ou confirmações obrigatórias na tela do operador. Dado provisório é marcado no cadastro, não como alerta.
- **Descida máxima no programa** e **Montagem recomendada** em blocos diferentes (`pair-descent` cinza, `pair-mount` azul).
- Uma ação `primary` por bloco. Alvos ≥ 44 px (48 px padrão).
- 3D com a nota discreta "Visualização orientativa; não certifica colisões".
- Contraste verificado: texto ≥ 4,5:1 sobre os fundos citados em cada token; bordas de controle e foco ≥ 3:1.

## Componentes

Button · Field · StatusBadge · ToConfirm · Alert · TechValue · TitleBlock · Segments · Stepper · JourneyMap · OSHeader · StockSection · ReferenceOrigin · ToolCard · TimeBlock · Table. Guias e prévias no artefato; a implementação é a mesma folha `components.css` + `journey.css`.
