# Aceites reais de homologação

Estas rotinas acessam os dois endereços reais do Viva+, criam exclusivamente fichas/autorrelatos de demonstração e exigem a credencial profissional da instalação. Não usam mocks nem substituem teste físico. Não apontar para pacientes reais.

Usam Node24 e as dependências fixadas do repositório. Senha somente em VIVA_NUVEM_SENHA fornecida por ambiente privado ou no arquivo ignorado .local/nuvem/credenciais.json criado pelo operador desta instalação (campo senhaInicial). Nenhuma senha padrão. Para interfaces, instale/reutilize o Chromium da versão Playwright do projeto; no ambiente Windows atual, o cache autorizado fica em work/playwright-browsers e pode ser indicado por PLAYWRIGHT_BROWSERS_PATH. Não registrar credenciais/links de convite em traces.

Execute da raiz, nesta ordem para cada rodada de fixtures novas:

```text
node tests/nuvem/portal-publico.cjs
node tests/nuvem/seguranca-publica.cjs
node tests/nuvem/api.cjs
node tests/nuvem/interface.cjs
node tests/nuvem/offline.cjs
node tests/nuvem/modulos.cjs
```

interface cria uma ficha nova com dois horários; offline depende dessa fixture e registra o segundo autorrelato. modulos usa a ficha da última execução aprovada de api, altera apenas seu plano fictício e ensaia OCR; respeitar os limites de fotos/OCR. Não repetir offline sozinho sobre uma fixture que já tem ambos os relatos.

Relatórios/sessões/convites privados não são artifacts de CI públicos. Os scripts não salvam tokens ou senhas; o JSON privado de API contém IDs de fixtures. Capturas públicas são feitas após remover o fragmento do convite e não incluem seu campo de emissão. Guardar somente evidências sanitizadas em docs/evidencias/nuvem-2026-11-04.

[Resultados aprovados e limitações](../../docs/evidencias/nuvem-2026-11-04/README.md).
