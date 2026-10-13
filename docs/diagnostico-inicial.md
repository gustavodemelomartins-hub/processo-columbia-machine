# Diagnóstico inicial — 12/10/2026

Acervo industrial: C:/Users/User/Desktop/Processo Columbia Machine, com oito pastas numeradas. Não havia .git nessa raiz. Continha 1 PDF de cinco páginas, 8 TAPs e 7 fotos originais; 04_Maquinas e 05_Dispositivos_Calcos_Fixacao não tinham cadastro físico completo. 06_Processos, 07_Ferramentas e 08_Simulacao_3D misturavam cadastros, resultados, screenshots, ZIPs e versões do HTML.

O VS Code aberto mostrava Welcome - workflow-vision - Visual Studio Code. O remote dessa pasta é gustavodemelomartins-hub/workflow-vision; não é o repositório Columbia. A captura da conversa e o título atual foram conferidos.

As fontes reais estavam em C:/Users/User/Documents/Codex/2026-10-10/referenced-chatgpt-conversation-this-is-an/work/github-pages. Árvore limpa, HEAD 3e736ad, dois commits locais após 449c195. O protótipo da Área de Trabalho tinha hash idêntico ao HTML desse HEAD: a447a2e83389cde7d61b2e52ef7de04eb2bc3f1348335a63ee1bde8f8e288a23. Código já separado parcialmente em src/, cinco suítes de domínio e seis de navegador, parser e fontes CNC preservados.

GitHub remoto: processo-columbia-machine, main em 449c195. Pages source main /, build_type legacy, build e deployment anteriores bem-sucedidos, HTTP 200. Dois commits locais (cadastro/fontes e cálculo de faceamento) ainda não estavam publicados. Nenhuma branch/história foi sobrescrita.

Problemas concretos: fonte de desenvolvimento escondida em pasta temporária de outra conversa; workspace de outro produto; JSONs espelhados e dados industriais misturados ao código; etapas/navegação/calços/geometria repetidos em JavaScript; status parcial apesar do conjunto completo O002–O008; duas legendas Alívios com codificação incorreta; tratamento incompleto de armazenamento null/arrays; ausência de mapa de arquitetura e publicação clara.

Baseline: build, cinco suítes de domínio, seis de navegador e duas verificações do parser passaram. Oito TAPs conferidos por SHA-256. Houve um timeout durante a reorganização enquanto outro build estava sendo executado; suíte correspondente repetida isoladamente passou. A validação final é feita com o build encerrado, antes da publicação.

Divergência industrial verificada no PDF, página 1: 95,75 antes do T.T., 95,0 depois. Cadastro informado: 96,0 antes. Preservada como decisão pendente da engenharia, com aviso contextual. Não foi corrigida silenciosamente nem propagada ao TAP.

Consolidação: pasta software dentro do acervo industrial passa a ser o único checkout oficial, com histórico Git preservado. Pastas numeradas anteriores são acervo/histórico, preservadas integralmente. Backup ZIP e bundle Git foram criados antes das mudanças. Um workspace explícito abre somente o software oficial; o checkout da conversa antiga recebe referência de continuidade e proteção contra publicação acidental.

Contagem do acervo antes da consolidação: 01_Desenhos1; 02_Programas_CNC8; 03_Fotos7; 04_Maquinas0; 05_Dispositivos_Calcos_Fixacao0; 06_Processos35; 07_Ferramentas2; 08_Simulacao_3D339 arquivos. Documentos narrativos de processo estão também preservados em docs/historico-processo, explicitamente históricos.
