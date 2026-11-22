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

## Terceiro lugar

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
