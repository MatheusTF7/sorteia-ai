import heat from '../../public/data/board-games/heat-pedal-to-the-metal.json';

export interface PlaymatTopic {
  id: string;
  label: string;
  ruleId: string;
  title?: string;
  step?: number;
  // Percentages of the original artwork, shared by both orientations.
  x: number;
  y: number;
  width: number;
  height: number;
  instructions: string[];
  example: string;
  related?: string[];
}

export const heatPlaymatTopics: PlaymatTopic[] = [
  {
    id: 'gear',
    label: '1',
    ruleId: 'gear',
    step: 1,
    x: 1,
    y: 9,
    width: 12,
    height: 21,
    instructions: [
      'Confira a marcha atual no marcador da lateral direita.',
      'Mantenha a marcha ou suba/desça 1 nível. Para mudar 2 níveis, mova 1 Calor do motor ao descarte.',
    ],
    example: 'Da 1ª para a 2ª marcha, a troca é gratuita. Da 1ª para a 3ª, pague 1 Calor.',
    related: ['gears', 'engine'],
  },
  {
    id: 'play-cards',
    label: '2',
    ruleId: 'play-cards',
    step: 2,
    x: 13,
    y: 6,
    width: 10,
    height: 15,
    instructions: [
      'Escolha da mão exatamente o número de cartas indicado pela marcha.',
      'Coloque as cartas viradas para baixo. Calor não é uma carta normalmente jogável.',
    ],
    example: 'Na 3ª marcha, escolha e jogue 3 cartas.',
    related: ['stress', 'cluttered-hand'],
  },
  {
    id: 'reveal-move',
    label: '3',
    ruleId: 'reveal-move',
    step: 3,
    x: 23,
    y: 7,
    width: 12,
    height: 18,
    instructions: [
      'Na sua vez de resolver, revele as cartas escolhidas. Resolva os símbolos +, se houver.',
      'Some a velocidade e mova o carro essa quantidade de casas, respeitando as posições ocupadas.',
    ],
    example: 'Cartas de velocidade 2 e 3 somam 5: mova 5 casas.',
    related: ['stress'],
  },
  {
    id: 'adrenaline',
    label: '4',
    ruleId: 'adrenaline',
    step: 4,
    x: 35,
    y: 5,
    width: 13,
    height: 20,
    instructions: [
      'Confira a ordem de resolução desta rodada: a adrenalina vale para o último carro a resolver o turno, ou os dois últimos quando 5 ou mais carros começaram a corrida.',
      'Se for elegível, pode usar +1 velocidade e/ou +1 resfriamento neste turno.',
    ],
    example: 'Em uma corrida iniciada com 6 carros, os dois últimos têm acesso à adrenalina.',
    related: ['cooldown'],
  },
  {
    id: 'react',
    label: '5',
    ruleId: 'react',
    step: 5,
    x: 55,
    y: 17,
    width: 6,
    height: 8,
    instructions: [
      'Confira os símbolos disponíveis na marcha e nas cartas.',
      'Resolva resfriamento, impulso e habilidades disponíveis na ordem que escolher. Toque nos símbolos desta etapa para consultar cada efeito.',
    ],
    example:
      'Se tiver Calor na mão e resfriamento disponível, pode devolver Calor ao motor antes de usar impulso.',
    related: ['cooldown', 'boost', 'stress'],
  },
  {
    id: 'slipstream',
    label: '6',
    ruleId: 'slipstream',
    step: 6,
    x: 61,
    y: 7,
    width: 12,
    height: 18,
    instructions: [
      'Confira se terminou o movimento na mesma casa ou imediatamente atrás de outro carro, em posição elegível para o vácuo.',
      'Se quiser, avance 2 casas. Use no máximo uma vez por turno e não some essas casas à velocidade usada nas curvas.',
    ],
    example:
      'Você se moveu com velocidade 5 e usou vácuo: avançou mais 2 casas, mas continua com velocidade 5 para conferir curvas.',
    related: ['corners'],
  },
  {
    id: 'corners',
    label: '7',
    ruleId: 'corners',
    step: 7,
    x: 73,
    y: 9,
    width: 12,
    height: 19,
    instructions: [
      'Para cada linha de curva cruzada, compare sua velocidade total com o limite daquela curva.',
      'Se ultrapassar o limite, mova do motor ao descarte uma carta de Calor por ponto excedido. Confira cada curva separadamente.',
    ],
    example: 'Velocidade 7 em uma curva de limite 5 exige pagar 2 Calor.',
    related: ['engine', 'spinout'],
  },
  {
    id: 'discard',
    label: '8',
    ruleId: 'discard',
    step: 8,
    x: 85,
    y: 6,
    width: 9,
    height: 14,
    instructions: [
      'Confira as cartas que ainda estão na mão e escolha quais quer descartar.',
      'Você pode descartar cartas indesejadas, mas não cartas de Calor ou Estresse.',
    ],
    example:
      'Uma carta básica de velocidade pode ser descartada; uma carta de Estresse deve permanecer na mão.',
    related: ['engine', 'stress'],
  },
  {
    id: 'draw',
    label: '9',
    ruleId: 'draw',
    step: 9,
    x: 91,
    y: 20,
    width: 8,
    height: 11,
    instructions: [
      'Descarte as cartas que jogou neste turno.',
      'Compre do baralho até ter 7 cartas na mão. Se o baralho acabar, embaralhe o descarte para formar um novo baralho.',
    ],
    example: 'Se restaram 3 cartas na mão, compre 4 para voltar a ter 7.',
    related: ['deck'],
  },
  {
    id: 'cooldown',
    label: '❄',
    ruleId: 'react',
    title: 'Resfriamento',
    x: 49,
    y: 7,
    width: 6,
    height: 10,
    instructions: [
      'Confira quantos pontos de resfriamento estão disponíveis: a 1ª marcha fornece 3 e a 2ª fornece 1.',
      'Para cada ponto utilizado, devolva uma carta de Calor da mão ao motor.',
    ],
    example: 'Com 2 Calor na mão e resfriamento 3, devolva as 2 cartas ao motor.',
    related: ['engine', 'gears'],
  },
  {
    id: 'boost',
    label: '♨',
    ruleId: 'react',
    title: 'Impulso · pagar 1 Calor',
    x: 55,
    y: 7,
    width: 6,
    height: 10,
    instructions: [
      'Até uma vez por turno, pague 1 Calor do motor para o descarte.',
      'Revele cartas do topo do baralho até encontrar uma carta básica de velocidade 1–4. Descarte as demais reveladas, coloque a carta básica junto das cartas jogadas e some sua velocidade.',
    ],
    example:
      'Se sua velocidade era 4 e o impulso revelou uma carta básica 3, sua velocidade passa a 7, inclusive para as curvas.',
    related: ['stress', 'corners', 'engine'],
  },
  {
    id: 'stress',
    label: '+',
    ruleId: 'stress',
    title: 'Símbolo + · Estresse',
    x: 49,
    y: 17,
    width: 6,
    height: 8,
    instructions: [
      'Para cada símbolo + a resolver, revele cartas do topo do baralho até encontrar uma carta básica de velocidade 1–4.',
      'Descarte as demais cartas reveladas, coloque a carta básica junto das cartas jogadas e some seu valor à velocidade.',
    ],
    example:
      'Você revela Calor e depois uma carta básica 2: descarte o Calor e acrescente 2 à velocidade.',
    related: ['deck'],
  },
  {
    id: 'deck',
    label: '▤',
    ruleId: 'draw',
    title: 'Baralho · esquerda',
    x: 2,
    y: 37,
    width: 23,
    height: 51,
    instructions: [
      'Use a área da bandeira quadriculada para o baralho de compra.',
      'Compre pelo topo. Quando o baralho acabar, embaralhe o descarte para formar um novo.',
    ],
    example: 'Na reposição, compre até completar 7 cartas na mão.',
    related: ['draw'],
  },
  {
    id: 'engine',
    label: 'H',
    ruleId: 'heat',
    title: 'Motor · reserva de Calor',
    x: 31,
    y: 71,
    width: 24,
    height: 17,
    instructions: [
      'Coloque no motor o Calor indicado na preparação da pista.',
      'Para pagar Calor, mova cartas do motor ao descarte. Para resfriar, devolva Calor da mão ao motor.',
    ],
    example: 'Pagar 2 Calor em uma curva move 2 cartas do motor ao descarte.',
    related: ['cooldown', 'boost'],
  },
  {
    id: 'discard-pile',
    label: '↓',
    ruleId: 'discard',
    title: 'Pilha de descarte · direita',
    x: 61,
    y: 37,
    width: 23,
    height: 51,
    instructions: [
      'Coloque aqui as cartas descartadas e o Calor pago do motor.',
      'Ao repor a mão, descarte também as cartas jogadas. Quando o baralho acabar, embaralhe esta pilha.',
    ],
    example: 'Ao pagar 1 Calor para o impulso, a carta sai do motor e vem para esta pilha.',
    related: ['draw', 'engine'],
  },
  {
    id: 'gears',
    label: '1–4',
    ruleId: 'gear',
    title: 'Marchas · lateral direita',
    x: 86,
    y: 33,
    width: 13,
    height: 64,
    instructions: [
      'Use o marcador para indicar sua marcha atual, de 1 a 4.',
      'Jogue tantas cartas quanto a marcha. Os símbolos azuis mostram resfriamento 3 na 1ª e resfriamento 1 na 2ª marcha.',
    ],
    example: 'Na 2ª marcha, jogue 2 cartas e tenha 1 resfriamento disponível ao reagir.',
    related: ['gear', 'play-cards', 'cooldown'],
  },
  {
    id: 'spinout',
    label: '!',
    ruleId: 'spinout',
    title: 'Derrapagem · falta de Calor',
    x: 31,
    y: 37,
    width: 24,
    height: 34,
    instructions: [
      'Se faltar Calor para pagar uma curva, gaste o Calor disponível e volte à primeira casa livre antes da curva causadora.',
      'Receba 1 Estresse se estava na marcha 1–2, ou 2 Estresse se estava na marcha 3–4. Volte à 1ª marcha.',
    ],
    example: 'Na 3ª marcha, uma derrapagem faz receber 2 Estresse e voltar à 1ª marcha.',
    related: ['corners', 'stress'],
  },
  {
    id: 'cluttered-hand',
    label: '?',
    ruleId: 'cluttered-hand',
    title: 'Mão travada',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    instructions: [
      'Se faltarem cartas jogáveis para sua marcha por excesso de Calor, complete a seleção com Calor.',
      'O carro não se move, volta à 1ª marcha e vai direto à reposição da mão.',
    ],
    example:
      'Se não conseguir escolher cartas jogáveis suficientes, consulte esta exceção antes de mover o carro.',
    related: ['play-cards', 'draw'],
  },
];

export function playmatRule(topic: PlaymatTopic) {
  return heat.playerAid.rules.find((rule) => rule.id === topic.ruleId)!;
}

export function playmatTitle(topic: PlaymatTopic): string {
  return topic.title ?? playmatRule(topic).title;
}

export const heatPlaymatSteps = heat.playerAid.turnSteps.map((step) => ({
  ...step,
  topic: heatPlaymatTopics.find((topic) => topic.id === step.ruleId)!,
}));
