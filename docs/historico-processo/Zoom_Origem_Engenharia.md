# Zoom no celular e origem da engenharia

O 3D agora aceita pinça com dois dedos: abrir aproxima; fechar afasta. Um dedo gira. Os botões + e − do celular também ajustam o zoom. Mouse, roda e teclado continuam funcionando no PC.

X0 e Y0 vêm cadastrados no centro da peça pela engenharia, conforme o padrão solicitado. A origem não é inferida do G-code. O operador consulta essa referência e confirma X/Y e Z na máquina; preencher a configuração não libera a operação automaticamente.

O cadastro usa reference_defaults para o padrão e steps[].references.x0/y0/z0 para exceções do programador. A tela operacional não edita a origem. Ao alterar a referência cadastrada, confirmações anteriores de origem e conclusão são invalidadas. Exceções sem coordenadas visuais suficientes não recebem um marcador inventado no 3D. Operações ainda não cadastradas continuam com A confirmar.

Fontes alteradas: prototype-template.html, operator_markup.html, operator_layer.js, operator.css, operator_process_config.json, build_prototype.py e package_poc.py. Novo arquivo: three_interaction.js. Teste novo: verify_mobile_origin.cjs, com dois toques reais via Chromium, zoom nos dois sentidos, cancelamento, giro com um dedo e exceção de engenharia. Testes existentes: verify_operator.cjs e verify-prototype.cjs. Os 16 originais continuam com seus hashes preservados.
