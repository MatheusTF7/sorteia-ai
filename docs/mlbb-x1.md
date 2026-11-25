# Campeonatos X1 de MLBB

Acesse **Campeonato X1 MLBB** no menu ou na tela inicial (`#/mlbb`). O módulo organiza campeonatos de eliminação simples com **2 a 64 jogadores**. É possível guardar até 50 campeonatos neste navegador e alternar entre eles. Criar um novo campeonato preserva os anteriores.

## Inscrições e regras

Adicione nicks separados por vírgula, ponto e vírgula ou quebra de linha, ou importe uma lista salva do aplicativo. Nicks repetidos são ignorados, considerando maiúsculas, espaços e Unicode normalizado. Cada jogador pode ter um ID do MLBB e servidor opcionais, editados pelo botão de lápis.

Configure separadamente a MDX das partidas, das semifinais e da final. X aceita **qualquer inteiro de 1 a 99**, inclusive números pares. O padrão é partidas MD1, semifinais MD1 e final MD3. Se houver apenas dois jogadores, vale o formato da final. Com três ou quatro jogadores, a primeira fase usa o formato das semifinais.

MDX significa uma série de até X jogos. A série acaba quando um jogador conquista a maioria necessária ou quando o limite é alcançado. Exemplos: MD1 aceita 1 × 0; MD5 aceita 3 × 1 ou 3 × 0. MD4 aceita 3 × 0 ou 3 × 1. **Empates ao fim de uma MD par exigem selecionar manualmente quem venceu pelo desempate previsto nas regras**; não há sorteio automático do vencedor. Um placar parcial, como 2 × 1 em MD4, não encerra a série.

A condição de vitória padrão é **Primeiro a fazer 3 kills**. A condição e a descrição de regras oferecem modelos para X1 da live (3 kills), primeira kill e destruição da base, além de texto personalizado. Os textos continuam editáveis. O regulamento padrão inclui a proibição de bater na torre, derrota ao destruir a torre com menos kills, a exceção de torre destruída por mínions (mais kills e mais farm) e a orientação de avisar no chat da live quando não tiver o herói sorteado. Os campeonatos existentes preservam seus textos. A descrição aparece também no resumo para compartilhar.

Cada MDX ocupa uma linha, com botões **−** e **+** e entrada numérica direta, respeitando os limites de 1 a 99 e o fechamento das inscrições.

## Chaves e resultados

**Sortear chaves** embaralha os jogadores e persiste a ordem sorteada. O desenho mostra todas as fases, com linhas de ligação e indicações como **Vencedor do jogo 1**. A numeração dos jogos é única dentro do campeonato.

Antes do sorteio, as configurações e o botão de sortear aparecem primeiro. Depois de gerar as chaves, o chaveamento passa a ser o conteúdo principal, acima das configurações. Reabrir as inscrições restaura a ordem inicial.

O **Jogo atual** é o primeiro duelo pronto para jogar na ordem da numeração; recebe destaque no painel e no cartão da chave. Ao registrar seu resultado, o destaque passa para o próximo duelo disponível. **Localizar na chave** centraliza o cartão na área de rolagem, que também acompanha a mudança do jogo atual. Essa indicação organiza a sequência; não significa que há uma transmissão ou partida em andamento no MLBB.

**Tela cheia** amplia o painel do chaveamento para ocupar a janela do aplicativo, mantendo as ações de resultado e compartilhamento. Saia pelo botão **Sair da tela cheia** ou pela tecla **Esc**. A rolagem da página fica bloqueada enquanto o painel está ampliado e o foco do teclado permanece nele, retornando ao botão de abertura ao sair.

Quando a quantidade não é potência de dois, os avanços sem adversário são distribuídos pela primeira fase. Todos os inscritos têm a mesma chance de ocupar essas vagas no sorteio. Ninguém recebe dois avanços automáticos e um adversário ainda indefinido não é tratado como vaga vazia. Um campeonato com N jogadores exige N − 1 duelos decididos, além dos avanços automáticos.

Use **Registrar resultado** para informar o **placar de cada jogo (kills)** e confirmar o vencedor daquele jogo. As kills não são limitadas pela MDX: em MD1, **3 × 0 em kills** corresponde a **1 × 0 na série**. Em MD3, adicione os jogos disputados até encerrar a série. O vencedor de cada jogo é sugerido pelo placar, mas pode ser ajustado para respeitar decisões por torre, farm ou desempate. A série é calculada pelos vencedores declarados. Não é permitido adicionar jogos depois que a série já foi vencida.

O modo **Vitórias na série** continua disponível para registrar apenas o resultado da série. Resultados antigos são preservados nesse modo, sem inventar placares de kills. **W.O.** continua permitindo indicar quem avançou. A chave, o resumo para compartilhar e os backups preservam os dados por jogo e da série. O vencedor avança para o confronto correspondente; a final concluída destaca o campeão. Não há consulta automática ao jogo nem envio de resultados para o MLBB.

## Sorteio de classe e heróis

Em **Sorteio de classe e heróis**, selecione uma ou mais classes base e marque os heróis banidos pela busca com retratos. Cada confronto, inclusive fases futuras e terceiro lugar, recebe uma classe e dois heróis distintos, um para cada lado da chave. A classe é sorteada primeiro, com chances iguais entre as classes selecionadas que ainda tenham pelo menos dois heróis elegíveis; depois são sorteados os heróis daquela classe. Heróis híbridos participam de cada classe cadastrada. Filtros como All, Gold Lane e Jungle do JSON original não são tratados como heróis.

**Abrir fase de bans**, abaixo do campo de heróis banidos, abre uma tela no estilo da fase de bans do jogo, com os retratos completos de `src/data/mlbb/heroes` (240 × 390). Toque em um herói para banir ou liberar: banidos ficam em cinza com a marca **Banido** e aparecem na faixa **Banidos** no topo, de onde também podem ser liberados. Os filtros incluem abas por classe (com a contagem de heróis e uma aba **Sem classe** para os não classificados), busca por nome sem diferenciar acentos, ordenação por nome, win rate, ban rate ou pick rate (a etiqueta do cartão mostra a estatística escolhida), **Somente banidos** e **Somente classes permitidas**. Heróis fora das classes permitidas aparecem esmaecidos. **Limpar bans** remove todos os bans; **Concluir** fecha a tela. Os bans são os mesmos do campo de busca e seguem as mesmas regras de substituição de picks.

Os picks aparecem no cartão e no destaque do jogo atual. **Sortear classe e heróis novamente** refaz somente os picks daquele confronto, sem alterar adversários ou resultados. Avanços automáticos não recebem picks. Os sorteios são mantidos ao recarregar e nos backups. Jogos concluídos não permitem novo sorteio; resultados anteriores à funcionalidade não recebem picks históricos inventados.

Classes e bans podem ser ajustados depois de chavear. Um pick ainda não jogado que deixar de respeitar a configuração será substituído; picks concluídos ficam no histórico. Sem classes com dois heróis disponíveis, o aplicativo avisa e impede gerar uma nova chave. Não há limite de uso de um herói entre confrontos diferentes.

### Estatísticas e modo do sorteio

Cada herói do duelo mostra **WR** (win rate), **PR** (pick rate) e **BR** (ban rate). Quando um dos heróis sorteados está na lista de counters do outro, o avatar do herói em vantagem ganha um contorno âmbar com o selo **Counter**, e um aviso **Confronto com counter** abaixo do par explica a relação, por exemplo, **Lesley é counter de Masha**. Se os dois forem counters um do outro, ambos recebem o selo e o aviso lista as duas relações. Os dados vêm de `src/data/mlbb/hero-stats.json`, coletados no [ranking oficial](https://www.mobilelegends.com/rank) em 22/11/2026, considerando todos os ranks nos **últimos 7 dias**. Não representam a temporada inteira e não são atualizados automaticamente; o aplicativo continua funcionando offline com esse retrato.

Em **Modo do sorteio**, escolha antes de sortear:

- **Aleatório** (padrão): o sorteio descrito acima. Estatísticas e counters aparecem apenas como informação.
- **Livre entre classes**: sorteia dois heróis distintos entre todos os que não estão banidos e têm ao menos uma classe permitida, sem sortear a classe antes. Os dois podem ser de classes diferentes, como **Mago × Tanque**, e o cartão mostra a classe de cada lado. Cada herói tem a mesma chance e um herói híbrido conta uma vez só, então classes com mais heróis, como Lutador, aparecem com mais frequência. A classe exibida para um híbrido é a primeira permitida na ordem Tanque, Lutador, Assassino, Mago, Atirador, Suporte.
- **Evitar counters**: descarta pares em que um herói está entre os 5 counters do outro, em qualquer direção.
- **Equilibrar por win rate**: além de evitar counters, só aceita pares cuja diferença de win rate não passe do limite escolhido (padrão de 3 pontos percentuais, de 0,5 a 15). Heróis sem estatísticas ficam de fora desse modo.

- **Confrontos temáticos**: sorteia um dos 67 duelos curados de `src/data/mlbb/duel-presets.json`, como **Irmãos Paxley** (Gusion × Aamon), **Rivais de Iga** (Hayabusa × Hanzo), **Fogo e gelo** (Valir × Aurora), **Resistência x regen** (Thamuz × Esmeralda) e **Cada dash tem preço** (Phoveus × Lancelot). O cartão mostra o nome e uma descrição curta no lugar da classe. Um confronto é elegível quando nenhum dos dois heróis está banido e cada um tem pelo menos uma classe permitida, considerando os ajustes de classe. Os confrontos são sorteados com chances iguais e o lado de cada herói também. Um confronto já usado em outro jogo do campeonato só se repete depois que todos os elegíveis tiverem sido usados, e **Sortear outro confronto temático** sempre tenta trazer um diferente. Alguns confrontos são counters de propósito e exibem o destaque de counter.

O botão **Ver os 67 confrontos temáticos**, logo abaixo do modo do sorteio, abre um diálogo com todos os confrontos: retratos, classes, tema, descrição, destaque de counter e o motivo de um confronto estar indisponível (herói banido ou sem classe permitida). Busque por herói ou tema, sem diferenciar acentos, e use **Somente disponíveis** para ver o que pode sair com a configuração atual. Os disponíveis aparecem primeiro. Em telas pequenas, o diálogo ocupa a tela inteira.

Para criar ou editar confrontos, acrescente itens em `duel-presets.json` com `id` (letras minúsculas, números e hífens), dois IDs de heróis em `heroes` e `title` e `description` em `pt-BR` e `en-US`. `npm run test:mlbb` confere se os heróis existem, têm classe e se os textos estão nos dois idiomas.

Nos modos **Evitar counters** e **Equilibrar por win rate**, a classe é sorteada com chances iguais entre as classes que tenham ao menos um par permitido. Depois, um dos pares permitidos daquela classe é sorteado com chances iguais, e o lado de cada herói também é sorteado. Classes sem par permitido deixam de contar no total de classes disponíveis. Mudar o modo ou o limite substitui apenas os picks ainda não jogados que deixarem de respeitá-lo; ao entrar ou sair de **Confrontos temáticos**, todos os picks ainda não jogados são sorteados de novo no novo modo. O modo e o limite são salvos no campeonato e no backup; campeonatos anteriores continuam no modo aleatório.

O catálogo vem de `src/data/mlbb/heroes.json`. Os avatares usam as miniaturas quadradas de `src/data/mlbb/heroes-mini` (128 × 128), indicadas pelo `localImage` de `hero-stats.json`, e são empacotados localmente pelo Webpack. Os retratos completos de `src/data/mlbb/heroes` são usados apenas na fase de bans; as imagens de filtros de rota (All, Gold Lane etc.) não entram no pacote. Como o JSON não possui classes, `hero-roles.json` complementa 124 classificações consultadas na [API oficial](https://mapi.mobilelegends.com/hero/list), usando o endpoint `/hero/detail?id=…`, em 22/11/2026. Hirara, Marcel, Sora, Obsidia, Zetian, Kalea, Lukas, Suyou e Zhuxin não estão classificados nessa API. Em **Conferir ou ajustar classes dos heróis**, atribua classes a eles para incluí-los ou ajuste qualquer classificação para o campeonato. Não são presumidas classes para os heróis sem dados. Essas alterações também são salvas no backup.

### Imagens em WebP

Os retratos e as miniaturas locais usam WebP com qualidade 85, mantendo as dimensões e a transparência dos PNGs originais. As URLs de origem nos JSONs continuam apontando para os arquivos oficiais; somente os caminhos `localImage` usam `.webp`.

Para converter novos PNGs colocados em `heroes` e `heroes-mini`, instale Pillow (`python -m pip install Pillow`) e execute `python scripts/convert-mlbb-images.py --remove-originals`. O script valida dimensões e transparência antes de remover os originais e informa a redução de tamanho. Sem `--remove-originals`, mantém os PNGs. Ao adicionar heróis, use `.webp` nos caminhos `localImage` dos JSONs.

## Configuração do terceiro lugar

Com pelo menos quatro jogadores, escolha **Como definir o 3º lugar** nas configurações. A escolha pode ser alterada após o sorteio sem refazer a chave principal:

- **Sem definição de 3º lugar**: mantém apenas a chave principal.
- **Confronto entre perdedores das semifinais**: cria um duelo separado na grade, com MDX própria configurada antes do sorteio. Os adversários são definidos pelas derrotas nas semifinais. A disputa aceita placares por jogo, resultado de série e W.O.
- **Quem perdeu para o campeão na semifinal**: após a final, atribui o terceiro lugar automaticamente ao adversário que o campeão eliminou na semifinal. O vice-campeão não participa desse critério.

Mudar o método pede confirmação se houver resultado de disputa de terceiro lugar e apaga somente esse resultado. Corrigir uma semifinal também invalida o resultado dependente da disputa de terceiro lugar. Corrigir a final recalcula o terceiro automático, preservando o confronto de terceiro já registrado. A disputa de terceiro lugar, quando habilitada, acrescenta um duelo aos N − 1 da chave principal.

É possível editar ou apagar resultados. Alterar somente o placar preservando o vencedor mantém os jogos seguintes. Alterar o vencedor ou apagar um resultado limpa todos os resultados posteriores que dependem daquele confronto, com confirmação quando necessário, preservando os outros ramos da chave.

Após o sorteio, inscrições e regras ficam fechadas para preservar os confrontos. **Reabrir inscrições** pede confirmação, apaga as chaves e resultados e mantém os jogadores e as regras para um novo sorteio. O nome do campeonato permanece editável.

## Salvamento e compartilhamento

O estado é salvo automaticamente no `localStorage`, na chave `sorteia-ai-mlbb-v1`: campeonatos, seleção atual, jogadores, regras, texto de inscrição ainda não adicionado, ordem sorteada e resultados. Não há conta nem sincronização entre dispositivos. Falhas de gravação exibem um aviso e não impedem continuar na sessão.

**Texto para compartilhar** abre uma prévia com regras, inscritos, chaves, placares e campeão. **Copiar texto** coloca o resumo na área de transferência para colar no grupo; não envia mensagens.

**Exportar backup** baixa um JSON do campeonato selecionado. **Importar backup** aceita um arquivo de até 1 MB e cria uma nova cópia, preservando os campeonatos existentes. Os dados são validados ao restaurar: nicks e IDs duplicados são rejeitados, uma ordem sorteada inválida é descartada e resultados inconsistentes ou com adversários diferentes são removidos junto com seus dependentes.

**Excluir campeonato** pede confirmação e remove somente o campeonato selecionado. Se for o último, o módulo abre um novo rascunho vazio.

## Verificação

Execute `npm run test:mlbb` para validar o chaveamento com todas as quantidades de 2 a 64 jogadores, progressão, MDX por fase, empates, W.O., correções, restauração e persistência. O projeto também pode ser validado com `npx tsc --noEmit` e `npm run build`.
