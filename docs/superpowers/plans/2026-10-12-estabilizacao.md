# Estabilização Columbia — plano e registro

Objetivo: entregar o piloto existente organizado e validado no mesmo Pages, sem redesenho nem integrações novas. Arquitetura: frontend estático com fontes app/, cadastro data/, assets e HTML gerado; parser e renderer preservados. Tecnologias: JavaScript, Python/Pillow, Three.js/gviewer, Playwright. Especificação: pedido do usuário nesta conversa, refletido em README/briefing.

- [x] Identificar pasta, workspace e remoto; comparar histórico e HTML; backup ZIP e bundle. Baseline com suítes existentes e hashes.
- [x] Separar fontes/dados/assets/testes, preservar IDs/armazenamento/parser, centralizar navegação/calços/espessura; testes de contrato e armazenamento primeiro (falharam por arquivos ausentes), implementação e nova validação.
- [x] Revisar HTTP/prefixo/desktop/celular, build reproduzível, documentos e revisão independente; commits, publicação fast-forward, confirmação de hash e deploy; instalar checkout oficial/workspace e arquivar referências antigas sem perda.

Decisões: preservar HTML autocontido para apresentação sem rede; adiar extração total do renderer para evitar regressão. Manter dados provisórios e divergência de engenharia explícita. Nenhum original foi renomeado dentro do conteúdo nem alterado. Desenvolver em branch isolada e publicar somente depois dos testes; publicação já autorizada pelo usuário. Arquivo antigo de desenvolvimento fica histórico protegido contra push acidental, com caminho do novo checkout.

Foco da revisão: URLs sob prefixo Pages, dados de ferramentas/etapas consistentes, migrações/storage, links e bytes de originais, WebGL/overflow mobile. Risco remanescente: liberação do processo exige engenharia; o protótipo não certifica usinagem.

Verificação: build, contrato de16 originais, parser (2 testes), 6 suítes JS de domínio/estado e 6 de navegador passaram. HTTP adicional passou sem erros em320/390/768/1440/1920. Revisão independente encontrou default legado do parser e correção confirmada; regeneração O001 em cópia isolada confirmou o destino novo e cadastro central. A publicação/instalação recebe o comprovante em Validacao-Entrega.json da entrega, depois de execução real.
