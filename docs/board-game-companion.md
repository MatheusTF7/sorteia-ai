# Board Game Companion

A página inicial e o menu lateral têm uma única entrada “Jogos de tabuleiro”,
que abre o hub em `/#/board-games`. O hub lista os jogos registrados, oferece
busca sem acentos e abre cada guia, como `/#/board-games/potion-explosion`.
Os guias têm um link “Todos os jogos” para retornar ao hub. No GitHub Pages,
o endereço completo inclui `/sorteia-ai/` antes do hash.

## Preparação de Potion Explosion

O botão “Preparar partida” do guia abre
`/#/board-games/potion-explosion/setup`. Reutiliza o seletor de listas e jogadores
de Heat, agora compartilhado em `SetupPlayerPicker.vue` e
`useSetupParticipants.ts`. A única lista disponível ou a lista padrão é carregada
automaticamente. Listas maiores que quatro não são truncadas: o usuário seleciona
de duas a quatro pessoas. Nomes também podem ser adicionados manualmente.

É possível sortear toda a preparação ou repetir individualmente:

- **Quem começa:** escolhe uma pessoa aleatoriamente e mantém a sequência dos
  jogadores selecionados, rotacionada a partir dela.
- **Tipos ativos:** escolhe seis tipos distintos dos oito e mostra os dois
  excluídos, com os nomes e imagens já disponíveis no catálogo.
- **Poções iniciais:** embaralha um estoque finito com duas peças de cada tipo
  ativo e distribui duas por jogador, passando na ordem normal e depois na inversa.
  Nenhum tipo pode ser distribuído mais de duas vezes no total. Não foi criada
  uma restrição que proíba duas peças do mesmo tipo para uma pessoa.

Esse sorteio é uma opção da plataforma, claramente distinguida da escolha de
peças prevista no regulamento. A página exibe a entrada `setup-starters` do JSON
e suas observações. As imagens identificam tipos; receitas de peças iniciais
continuam fora do dataset e devem ser conferidas nas peças físicas.

O bloco numérico `potionSetup` acrescenta ao JSON os seis tipos ativos e as duas
poções por pessoa já descritos no conteúdo, além do limite de duas peças iniciais
por tipo informado pelo usuário. Os textos de regras anteriores foram preservados.
O código não extrai números de frases nem duplica esses limites nos componentes.

Alterar jogadores limpa quem começa e a distribuição, preservando os tipos ativos.
Sortear novamente quem começa ou os tipos limpa as poções distribuídas. O botão
de distribuir fica desabilitado até os pré-requisitos estarem completos.
As listas salvas não são alteradas e os resultados da preparação não são persistidos.

`utils/participants.ts` e `utils/random.ts` compartilham identidade de jogadores,
seleção da lista inicial e Fisher–Yates entre os dois jogos. As preferências de
cores e os sorteios de Heat mantêm os testes existentes.

## Dados e extensão

- A fonte é `public/data/board-games/potion-explosion.json`, com regras preservadas
  e configuração numérica de preparação em `potionSetup`.
- `src/types/board-games.ts` descreve o dataset e o modelo comum de apresentação.
- `src/data/board-games.ts` registra loaders explícitos com imports dinâmicos de JSON.
  Para outro jogo compatível, adicione o dataset e seu registro com título,
  ícone, chave de descrição traduzida e loader; a rota recebe `gameId`.
  O hub deriva a lista desse registro sem carregar o conteúdo completo dos jogos.
  Não é necessário acrescentar entradas no menu nem na página inicial.
  Jogos com mecânicas diferentes podem exigir extensão do contrato. O catálogo de
  poções, pontuação e contagem regressiva são opcionais.
- `RuleEntryCard` e `RuleEntrySection` apresentam títulos, resumos e detalhes de
  qualquer entrada; regras não são codificadas nos componentes.
- A busca indexa nomes em português e originais, resumos/efeitos, detalhes e tags.
  Remove acentos, ignora caixa e exige todos os termos digitados. Os grupos de
  sinônimos do JSON expandem cada documento em ambas as direções.
- Os textos da interface usam os idiomas existentes; o conteúdo do JSON permanece
  em pt-BR, com aviso visível em ambos os idiomas. Os nomes não são apresentados
  como traduções oficiais.

## Offline e publicação

Os imports dinâmicos geram chunks locais com hash, que o `GenerateSW` existente
inclui no precache junto da aplicação. Não há nova estratégia de cache ou URL
absoluta de dados. Após concluir a instalação do service worker, a consulta pode
funcionar sem rede. O primeiro acesso/instalação e os manuais externos exigem rede.
O build SPA continua disponível, mas não oferece cache offline por service worker.

O catálogo utiliza as oito imagens fornecidas em `src/assets/pocao-*.png`,
associadas pelos IDs das poções em `src/data/board-game-images.ts`. Esse mapa
permanece separado das regras do JSON. Os imports geram URLs compatíveis com o
`publicPath` e assets incluídos no precache. Os cards exibem as imagens inteiras,
com texto alternativo, espaço reservado e carregamento lazy. Os valores e ícones
impressos nas imagens não são utilizados como fonte para regras ou pontuação.

Não foram adicionadas dependências. As rotas continuam com hash e o
`publicPath` existente; não há publicação automática nesta implementação.

## Pendências do dataset — não corrigidas por suposição

O próprio `sourceNotes` exige revisão com o PDF brasileiro e confirmação da
terminologia. Essas notas aparecem na página, junto ao link da editora.
As questões abaixo precisam dessa revisão antes de tratar o guia como validado:

- **Filtro da Lavamancia:** o efeito diz “Devolva ao dispensador” ingredientes
  “de um mesmo trilho”, sem esclarecer origem/destino ou a operação de retirada.
- **Areias do Tempo:** o dataset não esclarece se há restrições aos tipos de
  poção que podem ser reativados, inclusive outra Areias do Tempo.
- **Poção Abissal:** confirmar a interpretação conjunta de “até 1 ingrediente de
  cada cor” e “no máximo 1 ingrediente por trilho”; ambas foram preservadas.
- **Desempate:** não há instrução para um novo empate após as retiradas.
- Receitas e pontos por peça não estão catalogados. O guia não calcula pontuação
  nem preenche essas lacunas; mostra a fórmula fornecida.
- A visão geral usa os metadados, ingredientes e pontuação disponíveis. O JSON não
  contém uma introdução narrativa ou um passo a passo numerado completo do turno;
  o guia apresenta as entradas na ordem fornecida.

## Verificação

Execute `npm run test:board-games`, `npm run lint` e
`npx quasar build -m pwa`. O teste de busca usa o dataset real e cobre oito poções,
acentos, caixa, Unicode decomposto, nomes originais, efeitos, observações, tags,
sinônimos, filtros combinados e ausência de resultados.

`tests/potion-setup.test.mjs` cobre os 28 conjuntos possíveis de seis tipos,
distribuições para duas, três e quatro pessoas, estoque máximo de duas peças por
tipo, ausência de tipos excluídos, ordem normal/inversa, sorteio completo,
carregamento de listas e invalidação de resultados após mudanças. Ao todo, são
23 testes incluindo as verificações de Heat e busca.

Para verificar visualmente: abrir a rota em viewport estreito e desktop, alternar
tema/idioma, navegar com Tab/Enter, abrir observações, combinar busca e categoria,
limpar os filtros e testar um id de jogo inexistente. Para offline, servir o build
PWA sob `/sorteia-ai/`, aguardar o service worker ativar, desligar a rede e recarregar.

### Resultado nesta implementação

- Os 23 testes passaram (neste sandbox, executados com
  `node --test --test-isolation=none` com os três arquivos de teste, pois o runner
  padrão não conseguiu criar subprocessos).
- `tsc --noEmit` e ESLint dos arquivos alterados passaram.
- O lint geral encontrou um erro preexistente de `no-floating-promises` em
  `src-pwa/custom-service-worker.ts:18` e um aviso em `src-pwa/pwa-env.d.ts`.
  Esses arquivos não foram modificados; o modo atual usa `GenerateSW`.
- O build PWA passou; o precache gerado foi inspecionado quanto aos dados e chunks.
- A inspeção visual em mobile/desktop, a navegação por teclado e o teste offline
  real permanecem pendentes: a ferramenta de navegador não disponibilizou um
  browser nesta sessão. A grade usa uma coluna em telas pequenas e duas a partir
  de `md`, com largura máxima de 1000px. A visão geral é expansível para manter a
  busca próxima ao topo no celular. Os textos do dataset indicam `lang="pt-BR"`.
