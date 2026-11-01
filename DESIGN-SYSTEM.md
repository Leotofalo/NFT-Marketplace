# Sistema visual

O tema do marketplace usa fundo escuro, superfícies em tons de marrom e laranja como cor de destaque. Os tokens estão declarados em `src/index.css` e conectados ao tema do Tailwind CSS 4.

## Cores

| Uso | Valor |
| --- | --- |
| Destaque | `#D28A4C` |
| Destaque claro | `#DD9A5F` |
| Destaque escuro | `#C47B3E` |
| Texto principal | `#F5F1EB` |
| Texto secundário | `#CFB28C` |
| Fundo | `#140D0A` |
| Cartão | `#241612` |
| Superfície elevada | `#2F1D15` |
| Borda | `#3F2319` |
| Sucesso | `#00A66C` |
| Erro | `#ED1B2E` |

## Tipografia

Roboto Mono é carregada pelo Google Fonts e aplicada globalmente, com fallback monoespaçado.

## Aplicação

As variáveis `--gm-color-*` e `--gm-text-*` alimentam as cores utilitárias do Tailwind, como `bg-ink`, `bg-surface-card`, `text-primary` e `text-text-secondary`. Os componentes usam classes Tailwind locais; esta versão não inclui a biblioteca de componentes shadcn/ui.
