# Entrega — Processo Columbia Machine V1

Apresentação: 13/10/2026. Repositório: https://github.com/gustavodemelomartins-hub/processo-columbia-machine. URL mantida: https://gustavodemelomartins-hub.github.io/processo-columbia-machine/.

## Diagnóstico do estado inicial

A pasta industrial da Área de Trabalho não era Git. O VS Code estava em workflow-vision, outro repositório, confirmado pela janela atual e pelo remote. O checkout Columbia verdadeiro estava escondido em Documents/Codex/2026-10-10/.../work/github-pages, limpo e dois commits à frente do Pages. HEAD local3e736ad; publicação449c195. O HTML da pasta industrial era idêntico ao HEAD local. Baseline de build, testes e originais passou.

## Pasta oficial e estrutura

Pasta final: C:/Users/User/Desktop/Processo Columbia Machine/software. Abra o workspace Processo Columbia Machine.code-workspace na raiz industrial. O diretório antigo é histórico protegido contra push acidental. As oito pastas numeradas e todos os arquivos anteriores foram mantidos.

```
software/
  app/                 interface, domínios, interação e renderer existente
  data/
    process.json       fonte editável do processo e parâmetros
    machines.json      máquina piloto e perfis históricos isolados
    cnc/originals/     8 TAPs imutáveis
    derived/           percurso, estratégias, ferramentas e relatórios
  assets/              PDF/renders, fotos e marca
  vendor/              bibliotecas existentes
  licenses/            atribuições preservadas
  scripts/             build, contratos, parser e verificações
  tests/unit/          regras/estado
  tests/browser/       fluxos de navegador e HTTP
  docs/                arquitetura, dados, publicação, backlog e briefing
  index.html           saída gerada para o Pages existente
```

## O que foi corrigido

Separação de código/dados/assets/testes; fonte industrial central; etapas/calços/espessura fora do JavaScript espalhado; status falso de programas faltantes corrigido; acentos de Alívios corrigidos; armazenamento null/arrays inválidos recuperado sem trocar a chave e os IDs; build rejeita referências inconsistentes ou originais alterados; instalação fixada por package-lock; validação automática de qualidade; instruções claras de execução e publicação. Os dois commits locais anteriores entram na publicação e preservam o cálculo correto de faceamento por passes.

Interface preservada: operações e nove etapas ativas; programa/instruções; X/Y/Z; descida máxima e montagem recomendada; tabelas/fotos/medidas/corretor; simulação e desenho; navegação e registro manual; insertos/in-process. O004 continua único com T12/T4. Terceira operação permanece A confirmar.

## Executar

Na pasta software:

```sh
python -m pip install -r requirements.txt
npm ci
npx playwright install chromium
npm run build
npm run dev
```

Abra http://127.0.0.1:4173/. Para a apresentação offline pode abrir index.html diretamente, mantendo as pastas. `npm run check` e `npm test` repetem a validação. Leia README.md para publicar por push fast-forward no Pages já configurado em main, raiz.

## Riscos conhecidos e próximos passos

Divergência real: processo informado96,0 mm antes do tratamento, PDF página1 indica95,75; depois do tratamento95,0. Está sinalizada na tela e depende da engenharia, sem alterar os TAPs. Revisões/tolerâncias/origens/preset e montagem física precisam de confirmação. Não há certificação de colisão ou remoção volumétrica; o 3D é ilustrativo. Mini Portal ainda tem dados físicos desconhecidos; terceira operação indefinida. Registros/fotos estão no navegador, separados por origem, sem backup central. Primeiro download do HTML tem ~12,7 MB.

Depois da apresentação: fechar pendências de engenharia, backup/exportação dos registros, suíte de navegador em CI, refinamento visual incremental e redução de payload. Backend/login/rede/múltiplas máquinas ficam fora desta V1. O briefing visual separado especifica exatamente o que preservar no Claude/Cloud Design.

## Preservação e recuperação

ZIP integral antes das alterações e bundle do histórico Git acompanham a entrega. Nenhum TAP/PDF/foto original foi alterado; inventário de16 arquivos verificado. O acervo histórico mantém nomes/caminhos anteriores. O pacote de fontes final acompanha documentação e HTML para continuar sem depender de outra conversa.

## Verificação final e publicação

O resultado verificável, hashes, commits e status do deploy são registrados em Validacao-Entrega.json. Consulte esse registro junto a este relatório; HTTP200 e hash idêntico são exigidos para declarar a versão publicada.
