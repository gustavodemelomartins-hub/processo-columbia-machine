# Dados e proveniência

| Material | Destino oficial | Regra |
|---|---|---|
| Desenho FP16F 12V H8 - PB.pdf, 5 páginas | assets/drawings/originals | Imutável; renders são derivados |
| O001.TAP a O008.TAP | data/cnc/originals | Bytes originais e hashes recebidos |
| 7 fotografias JPEG | assets/photos | Originais preservados, nomes mantidos |
| Processo / instruções / X Y Z | data/process.json | Cadastro industrial com fonte e pendências |
| Mini Portal | data/machines.json | Dados desconhecidos null; perfis antigos isolados |
| Calços/garras/orientação | data/process.json: fixture | Montagem ilustrativa; validação física pendente |
| Ferramentas / descidas / percurso | data/derived | Extraído do TAP, separado da montagem medida |
| Descida / montagem recomendada | domínios app + parâmetros em data/process.json | ceil(descida + margem); não é análise de colisão |
| Medidas, fotos novas, status, insertos | localStorage | Registro manual por navegador; não versionado |

A fonte editável é data/process.json; runtime guarda apenas a compatibilidade da apresentação original e IDs históricos. Inventário data/originals.sha256.json cobre 16 originais: 8 TAPs + 1 PDF + 7 fotos. Os hashes dos TAPs também são comparados à lista recebida em data/cnc/originals/SHA256.json. O inventário CSV do acervo original continua preservado na pasta industrial e no backup.

Os dados derivados e o HTML gerado têm cópias técnicas por necessidade de build/publicação, não fontes independentes de cadastro. Não corrigir um programa ou uma dimensão em um derivado para aparentar consistência. Revisar o original/proveniência e regenerar com aprovação da engenharia.

Não considerar os valores do 3D como CAD validado. A tabela do desenho confirma largura 1104,9 e profundidade 568,3 na página 1; a espessura ilustrada mantém 96 informado pelo processo, com divergência explícita de 95,75 do desenho. Nenhuma medição de teste foi cadastrada como dado real.
