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

`check` valida contratos (inclusive a sequência da jornada), hashes de 21 TAPs + PDF + 7 fotos, parser e sete suítes de domínio/armazenamento. `npm test` executa também sete suítes de navegador (a de jornada percorre recebimento → 1ª → 2ª → 3ª → T.T. → retorno pós-TT em 5 larguras); screenshots e relatórios ficam em artifacts/, ignorado pelo Git. A suíte HTTP adicional usa `COLUMBIA_LIVE_URL` e `node tests/browser/verify_http.cjs`, com o servidor iniciado. Ela confere URLs relativas, PDF, WebGL e larguras 320/390/768/1440/1920. Para usar navegador/runtime já instalado, existem COLUMBIA_CHROMIUM_PATH e COLUMBIA_PLAYWRIGHT_MODULE.

## Jornada da OS (V1 simplificada)

Recebimento → 1ª operação → 2ª operação → 3ª operação → Tratamento térmico → Retorno pós-TT. No recebimento o operador informa a espessura real; o sistema calcula o sobremetal até 95,75 mm (antes do T.T.), com Face A apenas limpando (0,20 mm, editável) e Face B fechando a espessura. Cada etapa mostra nome, objetivo, 3D, programa, ferramenta, sobremetal, redução por passe, passes e tempos estimados, com uma única ação principal (Iniciar operação → Concluir operação → Ir para próxima etapa). Sem perguntas, controles ou confirmações na tela; perguntas ao responsável ficam em docs/informacoes-a-confirmar.md. Veja docs/modelo-processo.md, docs/ux-jornada.md e docs/design-system.md.

## Editar

- **data/process.json**: fonte única editável do processo. Partes, operação/etapas, IDs históricos, instruções, X/Y/Z, margens, calços, orientação, parâmetros de tempos, compensação e geometria ilustrativa.
- **data/machines.json**: cadastro histórico preservado; apenas mini-portal é usada no piloto. Dados físicos desconhecidos são null.
- **data/cnc/originals/**: TAPs recebidos, imutáveis; SHA256.json é o inventário recebido.
- **data/derived/**: percurso, ferramentas e estratégias extraídos dos TAPs; não cadastrar medidas físicas aqui.
- **app/**: interface e regras de domínio, separadas de dados e bibliotecas. app/journey contém a camada de jornada; app/design os componentes do design system.
- **design/tokens.json**: tokens do Design System Columbia Processo (fonte única, gerada em CSS no build; fonte do sistema, sem fontes incorporadas).
- **assets/**: PDF e renders do desenho, fotos originais e identidade visual.
- **vendor/** e **licenses/**: bibliotecas existentes e atribuições.
- **tests/**: testes por domínio e por fluxo de navegador.
- **index.html**: saída gerada e versionada para a publicação existente; nunca editar manualmente.

O build incorpora os dados, imagens e bibliotecas no HTML para preservar o uso sem rede. JSON externo alterado só entra no aplicativo depois do build. Não existe segunda cópia editável de Cadastro_Processo.json/MachineProfiles.json na raiz. Dados de produção do operador ficam no navegador, fora do Git.

## Fluxo preservado

Primeira operação: duas faces com O001. Segunda: dezesseis etapas, O002–O008, O009–O0013 (mesmo setup, garras passam para dentro) e O0014–O0017 (garras por dentro, nos calços), recebidos em 14/10/2026. Terceira: quatro etapas na mesa, com a peça tombada, O0018–O0021 (14/10/2026); O004 chama T12 e T4 na mesma etapa. Montagem sobre quatro calços e referências estão em O002. Ordem obrigatória O001 → O008; O009 → O0013 seguem na ordem dos nomes até confirmação; O0014 → O0017 e O0018 → O0021 confirmados (docs/informacoes-a-confirmar.md). Retorno pós-TT em levantamento.

Escolher etapa, consultar desenho e Play não registram execução. Iniciar operação e Concluir operação são ações manuais. Tempos do TAP recebem 20% (estimativa); preparação estimada ~45 min (provisória); faceamento calcula ceil(sobremetal por face / redução por passe), com padrão de 0,7 mm editável. Ferramentas mantêm Descida máxima no programa separada de Montagem recomendada: ceil(descida + margem), padrão de margem 10 mm. A medida real e a confirmação do conjunto têm prioridade. Compensação na Mini Portal usa (diâmetro real − nominal)/2 quando o programa contém compensação lateral; preencher depende de ação explícita.

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

Software funcional não significa processo liberado para máquina. Espessura antes do T.T.: 95,75 mm (desenho p.1, decisão do responsável); 95,0 mm depois. Os TAPs não são alterados. Tolerâncias, fixação, colisões e medidas físicas continuam fora da V1. 3D mostra montagem/percurso e não remove material nem certifica colisões. Terceira operação, retorno pós-TT e cadastro físico da Mini Portal em levantamento. O HTML ~12,7 MB pesa no primeiro carregamento; a apresentação local funciona sem CDN.

Comece por docs/METODO_DE_TRABALHO.md (como trabalhamos) e docs/rastreabilidade/MATRIZ_PROGRAMAS.md (programas recebidos). Veja também docs/arquitetura.md, docs/diagnostico-inicial.md, docs/dados-industriais.md, docs/publicacao.md, docs/backlog.md e docs/briefing-claude-design.md. O acervo anterior e backup integral ficam preservados; desenvolver somente nesta pasta oficial.
