# 11 — Design system

> Implementação: [`packages/ui`](../packages/ui/) (tokens e componentes) e [`apps/web`](../apps/web/).
> Status: base da F1.3. O logotipo oficial (decisão D-13) substituirá a marca textual sem mudar tokens.

## Ideia central

A MAGNUS é a **sala de operações** da empresa. A interface mostra o estado real da operação e deixa
claro, sem ambiguidade, quando uma pessoa precisa decidir algo. Nada de números ilustrativos: um
painel vazio diz que está vazio e explica o que vai aparecer ali.

## Cor com significado

A cor nunca é decoração; cada família tem um papel:

| Família | Tokens | Significado |
|---|---|---|
| Ônix / grafite | `onyx`, `graphite-950…500` | Estrutura: fundo, superfícies, linhas, texto terciário. |
| Névoa | `mist-50`, `mist-100`, `mist-300` | Texto principal e secundário. |
| **Roxo Magnus** | `magnus-950…300` | Agentes e plataforma trabalhando: item ativo, status "Funcionando", cursor do "agora", foco. |
| **Brasa** (vermelho-alaranjado) | `ember-950…300` | **Uma pessoa precisa decidir**: aprovações pendentes, ações sensíveis. Também a barra da marca. |

Regra: brasa só aparece onde há (ou haverá) decisão humana. Se tudo for brasa, nada é urgente.

## Tipografia

Uma família, **Archivo** (variável, eixo de largura), em dois papéis:

- **Expandida** (`font-wide`, largura 125): títulos de página, marca, frases de estado ("Nada aguardando
  aprovação.").
- **Normal**: todo o resto. Corpo em 15–16 px, linhas com no máximo ~60–70 caracteres.

Sem caixa alta em rótulos, sem fonte monoespaçada para dados; números tabulares (`tabular-nums`) em
horários e fases.

## Layout

| Largura | Navegação | Conteúdo |
|---|---|---|
| Celular (< 768 px) | Barra superior com a marca + menu em gaveta (`<dialog>` nativo: foco preso e Esc fecham) | Uma coluna |
| Tablet (768–1023 px) | Trilho de ícones (rótulos disponíveis para leitores de tela e como dica) | Uma coluna |
| Desktop (≥ 1024 px) | Trilho com rótulos e a fase em que cada tela fica funcional | Até 72 rem, grade 3:2 nos painéis |

O elemento marcante é um só: a **linha de operação de 24 h** no Painel, com o cursor do horário real.
A partir da Fase 2, cada execução de agente vira uma marca nessa linha.

## Componentes compartilhados (`@magnus/ui`)

| Componente | Uso |
|---|---|
| `StatusChip` | Vocabulário único de estado: `live` (Funcionando), `building` (Em construção), `planned` (Planejado), `attention` (Requer decisão), `demo` (Demonstração — tracejado, para dados de demonstração). |
| `Wordmark` | Marca textual provisória até o logotipo oficial. |

## Movimento

Um momento orquestrado: a faixa da linha de operação "preenche" até o agora ao abrir o Painel. Fora
isso, só movimento em resposta a ação (abrir o menu). `prefers-reduced-motion` desliga animações.

## Texto

- Português do Brasil; todas as strings em `apps/web/src/content/pt-BR.ts` (pronto para outro idioma).
- Frases curtas, voz ativa, sem jargão de sistema ("aprovar", não "submeter workflow").
- Estado vazio explica o que vai acontecer ali e quando — nunca simula dados.
- Botões dizem exatamente o que fazem.

## Acessibilidade (piso de qualidade)

- Contraste AA para texto; foco visível em roxo claro em todos os elementos interativos.
- Link "Pular para o conteúdo"; `aria-current` na navegação; landmarks (`nav`, `main`, `section` com
  título).
- Áreas de toque de no mínimo 40 px no celular.
