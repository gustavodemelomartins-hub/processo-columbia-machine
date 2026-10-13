# Continuidade do protótipo Columbia

A pasta oficial é software dentro de Processo Columbia Machine. Leia README.md e docs/arquitetura.md. app/ contém interface e domínios; data/process.json é o cadastro; index.html é gerado. Não reconstruir o aplicativo nem editar o HTML de saída.

Preservar um caso real na Mini Portal, duas faces O001, sete etapas O002–O008 e O004 único com T12/T4. IDs persistidos e chave columbia-os10713-demo-v2 não mudam sem migração. Play/navegação não registram execução. Manter campos Descida máxima no programa / Montagem recomendada separados; dados físicos desconhecidos null. Montagem recomendada ceil(descida+margem), padrão10; T1 limite operacional1 separado de Z nominal0; corretor Mini Portal (real−nominal)/2, ação explícita. Faceamento por sobremetal e ceil/0,7 editável; sem medida tempo A definir; margem de tempo20%. Não preencher fotos/medidas de testes na entrega.

Nenhuma rede, autenticação, conexão CNC ou múltiplas máquinas na V1. Perfis antigos ficam isolados. Renderer, TAPs, parser, desenho e registros existentes preservados. Divergência 96 versus95,75 antes do T.T. é da engenharia, não corrigir silenciosamente. Terceira operação indefinida. Não recolocar checklist antigo de preparação.

Depois de editar: npm run build, npm run check, npm test; verificar screenshots/3D/desenho/mobile, hash dos originais e fontes de L/N. Publicar só no Pages existente por push fast-forward. docs/briefing-claude-design.md rege a próxima fase visual.
