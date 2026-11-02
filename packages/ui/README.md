# @magnus/ui

Design system da MAGNUS (ver [docs/11-design-system.md](../../docs/11-design-system.md)).

| Arquivo | Conteúdo |
|---|---|
| `src/theme.css` | Tokens Tailwind v4 (`@theme`): cores com significado, fonte, raios, easing; base de foco e `prefers-reduced-motion`. |
| `src/status-chip.tsx` | `StatusChip`: vocabulário único de estados. |
| `src/wordmark.tsx` | Marca textual provisória (até o logotipo oficial, D-13). |

Uso no app (Tailwind v4):

```css
@import 'tailwindcss';
@import '@magnus/ui/theme.css';
@source '<caminho até>/packages/ui/src';
```

O app precisa listar `@magnus/ui` em `transpilePackages` (Next.js).
