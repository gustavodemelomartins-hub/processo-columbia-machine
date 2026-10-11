# Processo Columbia Machine

Instrução digital de trabalho CNC — OS10-713 / Mini Portal. Evolução do protótipo existente com programas reais O001–O008.

[Aplicação](https://gustavodemelomartins-hub.github.io/processo-columbia-machine/)

## Uso atual

Escolha a operação e um mini box de etapa. A primeira operação tem dois faceamentos O001; a segunda começa diretamente em O002 e segue até O008, com duas etapas de O004. A montagem nos quatro calços aparece nas instruções de O002. Terceira operação a definir.

Passos e referências acima da vista. Conferir orientação conforme desenho3D; X/Y no centro definido pela engenharia e preset da ferramenta no topo da peça. Segundo lado: tombar uma vez e ajustar corretor para fechar96 mm; elevar aos calços sem novo tombamento.

3D grande, rotação, pan, zoom, Play e desenho de cinco páginas. A lateral mostra somente as ferramentas do programa atual, parâmetros reais e valores físicos da tabela. Detalhes técnicos trazem estratégias e linhas exatas L/N. Mini boxes permitem registrar conclusão manual; navegar e simular não conclui etapas nem exige checklist.

## Ferramentas do trabalho

Tabela abaixo do processo, derivada dos programas: ferramenta, programas, descida máxima, montagem recomendada, montagem medida, diâmetro real, corretor, Montada e Na máquina. Editar diretamente; a lateral consulta a mesma atribuição. Ausência de medida/diâmetro/corretor aparece como Não informado. Sem workflow de preparação, magazine ou checklist na superfície atual.

Descida máxima preserva precisão do TAP. Recomendação arredonda para cima com margem padrão10 mm centralizada:99,97 +10 →110 mm. T1 mostra montagem padrão; não inventa medida física. Só calcular descida com trajetória/WCS resolvidos e Z0 no topo. Coordenada Z não é comprimento total de ferramenta; recomendação não valida colisões nem autoriza máquina.

Diâmetro real informado fica separado do nominal. Montagem medida e diâmetro real alimentam a representação 3D sem alterar a ponta do percurso. Porta-ferramenta, peça e fixação são representações; não há remoção de material ou validação física de colisão.

## Dados e continuidade

Registros persistem apenas no navegador/dispositivo. Dados antigos de preparação/checklist e máquina permanecem arquivados para compatibilidade. Mini Portal é a máquina do piloto; capacidade e posições físicas desconhecidas. Perfis provisórios Portal1/2 permanecem isolados e sem aplicação ao trabalho atual. Não há login, servidor, rede ou envio ao CNC.

[Auditoria antes](docs/ui-audit-simple-before.md) · [Auditoria depois e validação](docs/ui-audit-simple-after.md). Capturas novas somente na entrega local.

index.html é o HTML gerado pelo projeto original, com recursos incorporados. Cadastro_Processo.json é incorporado no build; editar só o JSON publicado não altera o HTML. Fontes do domínio ferramental em src/ferramental; demais fontes e testes no pacote de reprodução local. GitHub Pages publica main.

Three.js, @sienci/gviewer e easy_gcode_plot: MIT; atribuições em Licencas. Logo/favicon Columbia: [fonte oficial](https://columbiamachine.com.br/). Não atribuída licença aberta aos ativos da empresa ou desenho. PDF preservado em Desenhos; TAPs originais imutáveis no projeto local.
