# Programas recebidos (entrada)

Área de chegada de programas CNC novos, antes de entrarem no processo. Nada aqui é lido pelo build nem pelo aplicativo. Os programas do processo atual (OS 10-713) continuam em `data/cnc/originals/`.

## Estrutura de um lote

```text
data/cnc/recebidos/
  2026-10-15_OS10713_terceira-op/     ← data de recebimento + peça/OS + assunto curto
    LOTE.json                          ← cópia preenchida de LOTE.modelo.json
    originais/                         ← arquivos exatamente como chegaram (não editar, não renomear)
      O009.TAP
    fichas/                            ← gerado: python scripts/ficha_programa.py <lote>
```

## Procedimento

1. Criar a pasta do lote e copiar os arquivos para `originais/` sem alterar nome nem conteúdo.
2. Preencher `LOTE.json`: origem, peça/OS, o que o Gustavo disse sobre cada arquivo (com a frase dele) e o SHA-256.
3. Rodar `python scripts/ficha_programa.py data/cnc/recebidos/<lote>`. As fichas saem em `<lote>/fichas/`, com SHA-256 e linha de origem de cada valor.
4. Ler cada programa por inteiro quando possível; completar a seção "A preencher na análise" da ficha.
5. Atualizar `docs/rastreabilidade/MATRIZ_PROGRAMAS.md`. Vínculo com operação só com fonte; sem fonte fica pendente.
6. Dúvidas e divergências vão para `docs/informacoes-a-confirmar.md`, com valores e fontes.
7. Só depois de confirmado: incorporar ao processo (`data/process.json`, IDs novos, originais e hashes), regenerar derivados com `scripts/cnc_adapter.py` e rodar build e testes.

Nomes repetem entre peças (O001, O002…). O que identifica um programa é o lote, a peça/OS e o SHA-256.
