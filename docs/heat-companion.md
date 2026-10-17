# Heat: Pedal to the Metal — guia de consulta

Rota: `/sorteia-ai/#/board-games/heat-pedal-to-the-metal` no GitHub Pages.
A página inicial e o menu lateral oferecem uma única entrada para o hub em
`/sorteia-ai/#/board-games`, onde cada jogo pode ser selecionado.

## Escopo desta etapa

Conforme a observação final da solicitação, esta entrega é um guia de exploração
e pesquisa, no mesmo modelo de Potion Explosion. Inclui visão geral, preparação,
as nove etapas do turno como leitura, regras, referências de marchas e circuitos,
fontes e limitações de conteúdo. Não cria abas vazias de ferramentas.

Sorteios, distribuição de cores, grid, checklist interativo e calculadora de curvas
ficam para páginas secundárias em uma etapa futura. Os randomizadores do JSON
não são executados, inclusive os marcados `enabled: true`. Não há resultados
aleatórios de cartas, clima, condições da pista ou campeonato nesta entrega.

## Arquitetura e dados

- O JSON original é preservado e importado dinamicamente pelo registro existente.
- `src/types/heat.ts` descreve o formato de origem; `src/data/normalize-heat.ts`
  converte seus metadados e regras para o contrato comum do Companion.
- Textos de regras, detalhes, nomes de módulos, ordem/obrigatoriedade das etapas,
  valores das marchas e circuitos vêm do JSON. A ligação das etapas usa `ruleId`.
- A página, cards e busca são compartilhados com Potion Explosion. A extensão
  opcional do contrato acrescenta módulos e referências de corrida. Não há novas
  dependências, alteração de rotas ou mudança na estratégia de cache.
- `RacingReferenceTables.vue` apresenta dados de marchas e circuitos, com tabela
  de três colunas e cards que ocupam uma coluna em telas pequenas.
- Os quatro circuitos exibem as imagens fornecidas em `src/assets/`: `eua.webp`,
  `gra-bretanha.png`, `franca.webp` e `italia.jpg`. O mapa em
  `src/data/board-game-images.ts` associa os arquivos pelos IDs do JSON, separado
  das regras. As imagens são responsivas, sem cortes, com texto alternativo e
  carregamento lazy; os imports preservam o base path e o precache existentes.
- A busca inclui título, resumo, detalhes, tags e identificador/nome do módulo,
  usando a normalização existente de acentos, Unicode e caixa.
- `defaultEnabled` indica o módulo inicial, não indisponibilidade de conteúdo.
  Corrida básica é a seleção inicial. O seletor apresenta somente módulos
  declarados no JSON e permite consultar um de cada vez, sem uma opção que misture
  todos. Os módulos adicionais têm aviso de resumo e revisão. Campeonato aparece
  apenas quando selecionado, com o aviso de conteúdo incompleto. Referências da
  corrida básica não aparecem nos módulos adicionais.
- O conteúdo permanece em pt-BR, com aviso e marcação de idioma; a interface usa
  as traduções existentes. Notas de implementação do JSON não viram instruções
  para o jogador; a limitação sobre marcadores físicos aparece nas fontes.

## Pendências de conteúdo

- O dataset exige revisão com os manuais e a edição física. As regras são
  apresentadas como paráfrases, conforme o aviso original.
- Garagem, Lendas, Clima/Condições e Campeonato têm resumos, sem catálogo completo
  de cartas, marcadores e exceções. Campeonato não contém toda a pontuação nem
  toda a sequência de temporada.
- O vácuo refere-se a uma “posição elegível”, sem detalhar toda a geometria. O
  guia não completa essa regra por suposição.
- A preparação informa três Estresses e depois orienta conferir Heat/Estresse no
  circuito. Ambos os textos foram mantidos; os circuitos atuais listam três.
- Não foram catalogados os seis marcadores físicos de clima, combinações e
  multiplicidades de condições ou eventos de campeonato. Os sorteios digitais
  desses componentes continuam fora do escopo.
- Os links dos PDFs são cópias públicas identificadas no JSON, não arquivos
  hospedados pelo app. Exigem internet; os resumos locais são o conteúdo offline.

## Validação

`npm run test:board-games` cobre Potion Explosion e Heat: normalização do novo
formato, preservação dos textos, nove etapas por ID, busca sem acentos, detalhes,
tags, nome de módulo e isolamento ao trocar módulos/categorias. Também executar
TypeScript, lint e build PWA. Inspecionar o precache para confirmar a presença do
JSON e dos chunks com `/sorteia-ai/`.

Conferência manual: viewport de 320px e desktop, menu, entrada direta por URL,
troca entre os dois jogos, módulos e categorias, busca sem resultado, limpeza dos
filtros, teclado, temas e recarga offline após ativação do service worker.

### Resultado nesta sessão

- Nove testes passaram, incluindo os cinco testes existentes de Potion Explosion.
  No sandbox, foi usado `node --test --test-isolation=none` para evitar a restrição
  de criação de subprocessos do runner padrão.
- TypeScript, lint dos arquivos alterados e formatação passaram.
- O lint geral mantém o erro preexistente de `no-floating-promises` em
  `src-pwa/custom-service-worker.ts:18` e o aviso em `src-pwa/pwa-env.d.ts`.
- Build PWA e inspeção de precache foram executados com o prefixo `/sorteia-ai/`.
- A ferramenta de navegador não disponibilizou browser nesta sessão. A revisão
  visual em mobile/desktop e o teste offline real permanecem pendentes.
