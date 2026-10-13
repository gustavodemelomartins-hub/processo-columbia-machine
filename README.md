# Processo Columbia Machine — V1

Protótipo funcional da OS 10-713 / FP 16F H8 12V, para apresentação em 13/10/2026. Uma peça, uma Mini Portal, dados locais e fluxo manual. Aplicação e simulação existentes preservadas.

Site: https://gustavodemelomartins-hub.github.io/processo-columbia-machine/
Repositório: https://github.com/gustavodemelomartins-hub/processo-columbia-machine
Pasta oficial: `C:/Users/User/Desktop/Processo Columbia Machine/software`.
Abra o workspace `Processo Columbia Machine.code-workspace` na pasta industrial. O workspace workflow-vision é outro projeto.

## Rodar

Python 3.11+ e Node.js 22+. O HTML pronto pode ser aberto diretamente, com desenho/PDF na mesma estrutura de pastas. Não exige instalação para apresentação.

```sh
python -m pip install -r requirements.txt
npm ci
npx playwright install chromium
npm run build
npm run dev
```

Abra http://127.0.0.1:4173/. `npm run dev` serve apenas em localhost. Não há backend, autenticação, envio ao CNC nem conexão à fábrica. Se não editar fontes, basta o servidor local ou abrir index.html.

```sh
npm run check
npm test
```

`check` valida contratos (inclusive jornada e perguntas em aberto), hashes de 8 TAPs + PDF + 7 fotos, parser e sete suítes de domínio/armazenamento. `npm test` executa também sete suítes de navegador (a de jornada percorre recebimento → controle → 2ª operação em 5 larguras); screenshots e relatórios ficam em artifacts/, ignorado pelo Git. A suíte HTTP adicional usa `COLUMBIA_LIVE_URL` e `node tests/browser/verify_http.cjs`, com o servidor iniciado. Ela confere URLs relativas, PDF, WebGL e larguras 320/390/768/1440/1920. Para usar navegador/runtime já instalado, existem COLUMBIA_CHROMIUM_PATH e COLUMBIA_PLAYWRIGHT_MODULE.

## Jornada da OS (V1 visual)

A tela segue a peça: Recebimento e medição inicial → 1ª operação → Controle de espessura → Tratamento térmico (sequência a confirmar) → 2ª operação → Controle → 3ª operação (não definida). Cabeçalho permanente da OS, roteiro de 8 seções por etapa, 3D contextual, tempos com início/decorrido, passaporte da peça e lista de informações a confirmar. Veja docs/modelo-processo.md (como o processo está modelado), docs/informacoes-a-confirmar.md, docs/design-system.md e docs/ux-jornada.md.

## Editar

- **data/process.json**: fonte única editável do processo. Partes, operação/etapas, IDs históricos, instruções, X/Y/Z, margens, calços, orientação, parâmetros de tempos, compensação e geometria ilustrativa.
- **data/machines.json**: cadastro histórico preservado; apenas mini-portal é usada no piloto. Dados físicos desconhecidos são null.
- **data/cnc/originals/**: TAPs recebidos, imutáveis; SHA256.json é o inventário recebido.
- **data/derived/**: percurso, ferramentas e estratégias extraídos dos TAPs; não cadastrar medidas físicas aqui.
- **app/**: interface e regras de domínio, separadas de dados e bibliotecas. app/journey contém a camada de jornada; app/design os componentes do design system.
- **design/tokens.json**: tokens do Design System Columbia Processo (fonte única, gerada em CSS no build; fontes IBM Plex em assets/fonts).
- **assets/**: PDF e renders do desenho, fotos originais e identidade visual.
- **vendor/** e **licenses/**: bibliotecas existentes e atribuições.
- **tests/**: testes por domínio e por fluxo de navegador.
- **index.html**: saída gerada e versionada para a publicação existente; nunca editar manualmente.

O build incorpora os dados, imagens e bibliotecas no HTML para preservar o uso sem rede. JSON externo alterado só entra no aplicativo depois do build. Não existe segunda cópia editável de Cadastro_Processo.json/MachineProfiles.json na raiz. Dados de produção do operador ficam no navegador, fora do Git.

## Fluxo preservado

Primeira operação: duas faces com O001. Segunda: sete etapas O002–O008; O004 chama T12 e T4 na mesma etapa. Montagem sobre quatro calços e referências estão em O002. Terceira operação continua A confirmar.

Escolher etapa, consultar desenho e Play não registram execução. Iniciar etapa e Concluída são ações manuais. Tempos recebem 20%; faceamento calcula ceil(sobremetal por face / redução por passe), com padrão informado de 0,7 mm. Sem medida o total fica A definir. Ferramentas mantêm Descida máxima no programa separada de Montagem recomendada: ceil(descida + margem), padrão de margem 10 mm. A medida real e a confirmação do conjunto têm prioridade. Compensação na Mini Portal usa (diâmetro real − nominal)/2 quando o programa contém compensação lateral; preencher depende de ação explícita.

Fotos/medidas/status persistem em localStorage na chave histórica columbia-os10713-demo-v2. Os IDs 1/3/7 continuam arquivados para migração. O mesmo site mantém a origem de armazenamento; arquivo local/localhost/dispositivo diferente têm registros separados. Um estado inválido pode ser recuperado; registros válidos e políticas de migração existentes são preservados.

## Publicar no mesmo link

O GitHub Pages está configurado em main, pasta raiz, modo legacy, com .nojekyll. Mantenha essa configuração.

```sh
npm run build
npm run check
npm test
git add app data assets scripts tests docs README.md CLAUDE.md package.json package-lock.json index.html .github
git commit -m "fix: estabiliza prototipo Columbia"
git push origin HEAD:main
```

Publique apenas após verificar se origin/main ainda é ancestral de HEAD. Aguarde o workflow Pages, confira a URL e compare o SHA-256 do HTML servido com o local. Não faça force-push. A qualidade roda por GitHub Actions; o deploy legacy do Pages continua independente, portanto valide localmente antes do push.

## Limites reais

Software funcional não significa processo liberado para máquina. PDF página 1 indica 95,75 mm antes do T.T. e 95,0 mm depois; o processo informado usa 96,0 mm antes. A divergência está visível e documentada, sem alteração automática do TAP. Revisão, tolerâncias, origens, fixação, colisões e medidas físicas exigem decisão da engenharia. 3D mostra montagem/percurso e não remove material nem certifica colisões. Terceira operação e cadastro físico da Mini Portal estão pendentes. O HTML ~12,7 MB pesa no primeiro carregamento; a apresentação local funciona sem CDN.

Veja docs/arquitetura.md, docs/diagnostico-inicial.md, docs/dados-industriais.md, docs/publicacao.md, docs/backlog.md e docs/briefing-claude-design.md. O acervo anterior e backup integral ficam preservados; desenvolver somente nesta pasta oficial.
