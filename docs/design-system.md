# Design System — Columbia Processo

Fonte única: `design/tokens.json` (cores, tipografia, espaçamento, raios, sombras, tamanhos, layout). O build (`scripts/design_tokens.py`) gera as variáveis CSS e incorpora as fontes IBM Plex (OFL, `licenses/IBM-Plex-OFL-1.1.txt`) no HTML offline. Componentes em `app/design/components.css` (prefixo `ds-`); casca da aplicação em `app/journey/journey.css`.

O mesmo conteúdo está publicado como artefato **Design System "Columbia Processo"** no Claude (tokens, brand book, 16 componentes com prévia e guia, logo). Ao mudar tokens ou componentes aqui, republicar o artefato com os mesmos arquivos.

## Direção

Software industrial moderno + documentação de processo + interface CNC: superfícies claras, filetes finos, cantos quase retos (2–4 px), trilhos de estado de 4 px, números tabulares, códigos em mono, azul Columbia só para ação e etapa atual. Sem gradientes, sem emoji, sem cartões com borda lateral colorida.

## Regras que não podem ser quebradas

- Estado sempre com palavra (Concluída, Atual, Em execução, Aguardando, A confirmar, Não definida).
- Dado ausente → `ds-tbc` "Informação a confirmar" com a pergunta; nunca um valor plausível.
- **Descida máxima no programa** e **Montagem recomendada** em blocos diferentes (`pair-descent` cinza, `pair-mount` azul).
- Uma ação `primary` por bloco. Alvos ≥ 44 px (48 px padrão).
- 3D com o selo "Visualização orientativa — não certifica colisões".
- Contraste verificado: texto ≥ 4,5:1 sobre os fundos citados em cada token; bordas de controle e foco ≥ 3:1.

## Componentes

Button · Field · StatusBadge · ToConfirm · Alert · TechValue · TitleBlock · Segments · Stepper · JourneyMap · OSHeader · StockSection · ReferenceOrigin · ToolCard · TimeBlock · Table. Guias e prévias no artefato; a implementação é a mesma folha `components.css` + `journey.css`.
