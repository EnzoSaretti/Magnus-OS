# 11 — Design system

> Implementação: [`packages/ui`](../packages/ui/) (tokens, logo e componentes) e [`apps/web`](../apps/web/).
> Status: revisão de 2026-11-02 a partir das referências enviadas pelo fundador e do logotipo oficial.

## Ideia central

A MAGNUS é a **sala de operações** da empresa: indicadores grandes e legíveis, gráficos de tendência,
o que precisa de decisão humana em destaque e um assistente sempre à mão. Nada de números
ilustrativos passando por reais: tudo o que vem de demonstração leva o selo **Demonstração**.

## Marca

- Logo oficial: [`docs/brand/magnus-logo-original.png`](brand/magnus-logo-original.png). Redesenhado em
  SVG em `packages/ui/src/logo.tsx` (`LogoMark`) e usado também como ícone do app (`app/icon.svg`).
- Símbolo: quadrado arredondado; 56% superiores em índigo `#2d1b8e` e marinho `#1a145c` com o "V" violeta
  (`#8a1ad7` → `#6412c0`) que forma o M; base vermelho-alaranjada (`#f23b27` → `#de2618`).
- `Wordmark`: símbolo + "MAGNUS" em Archivo expandida, com espaçamento largo, como na arte original.
- Cores da marca (`brand-*`) aparecem no logo, no avatar, no cartão do assistente e no cartão de
  progresso — momentos de marca, não estado.

## Cor com significado

| Família | Tokens | Significado |
|---|---|---|
| Ônix / grafite | `onyx`, `graphite-950…500` | Estrutura: fundo, cartões, linhas, texto terciário. |
| Névoa | `mist-50/100/300` | Texto principal e secundário. |
| **Roxo Magnus** | `magnus-950…300` | Agentes e plataforma trabalhando: item ativo, status "Funcionando", cursor do agora, foco. |
| **Brasa** | `ember-950…300` (alinhada ao vermelho do logo) | **Uma pessoa precisa decidir**: aprovações, ações sensíveis, botão "Revisar". |
| Marca | `brand-indigo/navy/violet` | Logo e momentos de marca. |
| Gráficos | `chart-1` `#8b6dff`, `chart-2` `#1a9db2`, `chart-3` `#f2503a` | Séries categóricas, sempre nesta ordem. |

A paleta dos gráficos foi **validada com o script de verificação de paletas** contra o fundo escuro:
faixa de luminosidade, croma, separação para daltonismo (protan/deutan ΔE ≥ 14) e contraste ≥ 3:1.
`chart-3` (brasa) é usado só para séries ligadas a aprovação — mantém o significado da cor.

## Tipografia

Uma família, **Archivo** (variável, eixo de largura): expandida (`font-wide`) para títulos, números de
destaque e marca; normal para o resto. Números tabulares em indicadores, eixos e horários. Sem caixa
alta em rótulos.

## Layout do console

| Largura | Navegação | Painel |
|---|---|---|
| Celular (< 768 px) | Barra superior com o símbolo + gaveta (`<dialog>`) com navegação e conta | Uma coluna |
| Tablet (768–1279 px) | Trilho de ícones (tablet) ou barra lateral (≥ 1024 px) | Indicadores 2×2, painéis empilhados |
| Desktop (≥ 1280 px) | Barra lateral com grupos (Operação, Conhecimento, Plataforma), selos de fase e cartão de progresso | Grade de 12 colunas |

Topo: organização ativa (F1.5) à esquerda; ambiente e menu da conta (avatar com iniciais, nome, Sair)
à direita.

Ordem do Painel: saudação com a data → aviso de demonstração → 4 indicadores → execuções (linha) e
tarefas do mês (rosca) → "Aguardando você" e assistente → linha de operação de 24 h e atividade dos
agentes → estado da plataforma (dado real).

## Componentes

| Componente | Onde | Uso |
|---|---|---|
| `LogoMark`, `Wordmark` | `@magnus/ui` | Símbolo e logotipo. |
| `StatusChip` | `@magnus/ui` | `live`, `building`, `planned`, `attention`, `demo` (tracejado). |
| `surface-card` | utilitário CSS | Cartão: borda fina, raio de 20 px, leve luz no topo. |
| `Panel`, `KpiTile` | `apps/web/src/components/dashboard` | Cartão com título (e selo de demonstração) e indicador com contexto e atalho para o módulo. |
| `LineChart`, `DonutChart` | `apps/web/src/components/charts` | SVG próprio, sem biblioteca: um eixo só, curvas monotônicas (não inventam picos), rótulos diretos no fim das linhas, legenda, dica com cruz ao passar o mouse ou com as setas do teclado, tabela oculta para leitores de tela; rosca com espaçamento entre fatias e legenda sincronizada. |

## Dados de demonstração

- Ficam em um único arquivo: `apps/web/src/content/demo/dashboard.ts`, com cabeçalho explicando que não
  vêm de nenhuma organização.
- Todo cartão alimentado por ele mostra o selo **Demonstração**, e o Painel abre com um aviso.
- Ações nunca são simuladas: "Revisar" e as sugestões do assistente levam às telas reais dos módulos; o
  campo do assistente fica desabilitado com "O assistente chega na Fase 2".
- Cada export é substituído por consulta real quando o módulo correspondente entra (Fase 2+).

## Movimento

Um momento orquestrado: a faixa da linha de operação preenche até o agora. Fora isso, só movimento em
resposta a ação (menus, destaque de fatias). `prefers-reduced-motion` desliga animações.

## Texto

Português do Brasil em `apps/web/src/content/pt-BR.ts`; frases curtas, voz ativa; estados vazios dizem
o que virá e quando; botões dizem exatamente o que fazem.

## Acessibilidade

Contraste AA no texto; foco visível; "Pular para o conteúdo"; `aria-current` na navegação; gráficos com
`aria-label`, navegação por teclado e tabela equivalente; cor nunca é a única pista (legendas, rótulos
e ícones acompanham).
