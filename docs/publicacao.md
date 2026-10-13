# Execução e publicação

A URL oficial é https://gustavodemelomartins-hub.github.io/processo-columbia-machine/. Repositório processo-columbia-machine, Pages na raiz de main, .nojekyll. O HTML autocontido mantém links relativos ao PDF, funcionando com o prefixo do repositório.

Após editar: npm run build, npm run check, npm test. Conferir git diff, originais e screenshots. Fazer commit e push fast-forward para main, nunca force. Acompanhar o Pages build/deployment e exigir conclusão success. Comparar conteúdo/hash do HTML publicado; HTTP 200 sozinho não prova atualização. Conferir desenho/PDF, ferramentas, navegação e 3D no link real.

GitHub Actions de qualidade valida build/contratos/parser/domínios. O modo legacy de Pages publica independentemente dessa ação; a verificação local é obrigatória antes do push. Não modificar a configuração para introduzir outra URL ou sistema de deploy na véspera da apresentação.

Reversão: preservar o histórico e usar git revert no commit específico, reconstruir se necessário e publicar via push fast-forward. Para recuperar a versão anterior completa existe backup ZIP + bundle da história; não fazer reset --hard/force-push no remoto.

Apresentação offline: abrir o index.html dentro do software oficial, mantendo assets/drawings/originals junto dele. Como o estado é por origem, registros do site e da cópia local são distintos. Dados existentes do link publicado permanecem sob a mesma chave/origem.
