# Depois do protótipo

1. Engenharia: (resolvido em 13/10: 95,75 mm antes do T.T. para esta peça.) Registrar revisões aprovadas, tolerâncias e critérios de inspeção. Definir terceira operação. Validar origens, preset, calços, garras, diâmetros reais, corte útil e conjunto físico da Mini Portal.
2. Continuidade: exportar/importar registros do operador com versão e validação; backup de localStorage, inclusive fotos, antes de migrações. Política explícita de alteração de processo sem apagar histórico.
3. Qualidade: CI com suíte completa WebGL/navegador e aprovação antes do Pages; testes de falhas de armazenamento, recuperação de fotos e acessibilidade por teclado/leitor de tela.
4. Performance: reduzir HTML ~12,7 MB, extrair assets pesados e carregar por demanda, mantendo pacote offline e links relativos. Extrair renderer monolítico apenas com provas de equivalência.
5. Visual: refinamento pelo briefing separado, sem trocar arquitetura/fluxo/dados industriais. Validar notebook e celular no ambiente real de apresentação.
6. Produção, fora da V1: licenças e autorização corporativa para exposição de documentos industriais, publicação sob domínio interno se necessário; estudo de backend, rede, login e múltiplas máquinas somente depois de fechar o piloto. Não há integração de fábrica implementada.

## Direção informada pelo Gustavo em 14/10/2026 (planejada, não aprovada como requisito)

7. Processo gerado automaticamente quando o programador envia os programas; uma tela de revisão onde ele posiciona as garras no 3D e escreve observações. A primeira versão dessa tela entra nas próximas rodadas, com os próximos programas.
8. Padrão de setup para esta família de peças (grids): o mesmo jeito de fixar e sequenciar se repete.
9. Depois: gerar um processo completo a partir do desenho ou do modelo 3D de qualquer peça.
