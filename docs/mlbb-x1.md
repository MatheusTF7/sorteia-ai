# Campeonatos X1 de MLBB

Acesse **Campeonato X1 MLBB** no menu ou na tela inicial (`#/mlbb`). O módulo organiza campeonatos de eliminação simples com **2 a 64 jogadores**. É possível guardar até 50 campeonatos neste navegador e alternar entre eles. Criar um novo campeonato preserva os anteriores.

## Inscrições e regras

Adicione nicks separados por vírgula, ponto e vírgula ou quebra de linha, ou importe uma lista salva do aplicativo. Nicks repetidos são ignorados, considerando maiúsculas, espaços e Unicode normalizado. Cada jogador pode ter um ID do MLBB e servidor opcionais, editados pelo botão de lápis.

Configure separadamente a MDX das partidas, das semifinais e da final. X aceita **qualquer inteiro de 1 a 99**, inclusive números pares. O padrão é partidas MD1, semifinais MD1 e final MD3. Se houver apenas dois jogadores, vale o formato da final. Com três ou quatro jogadores, a primeira fase usa o formato das semifinais.

MDX significa uma série de até X jogos. A série acaba quando um jogador conquista a maioria necessária ou quando o limite é alcançado. Exemplos: MD1 aceita 1 × 0; MD5 aceita 3 × 1 ou 3 × 0. MD4 aceita 3 × 0 ou 3 × 1. **Empates ao fim de uma MD par exigem selecionar manualmente quem venceu pelo desempate previsto nas regras**; não há sorteio automático do vencedor. Um placar parcial, como 2 × 1 em MD4, não encerra a série.

A rota e a condição de vitória de cada jogo começam com sugestões editáveis. Use a descrição para registrar bans, heróis permitidos, feitiços, atrasos, pausas e desempates. Essas opções são decisões do organizador, não um regulamento oficial do MLBB. A descrição aparece também no resumo para compartilhar.

## Chaves e resultados

**Sortear chaves** embaralha os jogadores e persiste a ordem sorteada. O desenho mostra todas as fases, com linhas de ligação e indicações como **Vencedor do jogo 1**. A numeração dos jogos é única dentro do campeonato.

Quando a quantidade não é potência de dois, os avanços sem adversário são distribuídos pela primeira fase. Todos os inscritos têm a mesma chance de ocupar essas vagas no sorteio. Ninguém recebe dois avanços automáticos e um adversário ainda indefinido não é tratado como vaga vazia. Um campeonato com N jogadores exige N − 1 duelos decididos, além dos avanços automáticos.

Use **Registrar resultado** para informar jogos vencidos na série ou selecionar um vencedor por **W.O.**. O vencedor avança para o confronto correspondente; a final concluída destaca o campeão. Não há consulta automática ao jogo nem envio de resultados para o MLBB.

É possível editar ou apagar resultados. Alterar somente o placar preservando o vencedor mantém os jogos seguintes. Alterar o vencedor ou apagar um resultado limpa todos os resultados posteriores que dependem daquele confronto, com confirmação quando necessário, preservando os outros ramos da chave.

Após o sorteio, inscrições e regras ficam fechadas para preservar os confrontos. **Reabrir inscrições** pede confirmação, apaga as chaves e resultados e mantém os jogadores e as regras para um novo sorteio. O nome do campeonato permanece editável.

## Salvamento e compartilhamento

O estado é salvo automaticamente no `localStorage`, na chave `sorteia-ai-mlbb-v1`: campeonatos, seleção atual, jogadores, regras, texto de inscrição ainda não adicionado, ordem sorteada e resultados. Não há conta nem sincronização entre dispositivos. Falhas de gravação exibem um aviso e não impedem continuar na sessão.

**Texto para compartilhar** abre uma prévia com regras, inscritos, chaves, placares e campeão. **Copiar texto** coloca o resumo na área de transferência para colar no grupo; não envia mensagens.

**Exportar backup** baixa um JSON do campeonato selecionado. **Importar backup** aceita um arquivo de até 1 MB e cria uma nova cópia, preservando os campeonatos existentes. Os dados são validados ao restaurar: nicks e IDs duplicados são rejeitados, uma ordem sorteada inválida é descartada e resultados inconsistentes ou com adversários diferentes são removidos junto com seus dependentes.

**Excluir campeonato** pede confirmação e remove somente o campeonato selecionado. Se for o último, o módulo abre um novo rascunho vazio.

## Verificação

Execute `npm run test:mlbb` para validar o chaveamento com todas as quantidades de 2 a 64 jogadores, progressão, MDX por fase, empates, W.O., correções, restauração e persistência. O projeto também pode ser validado com `npx tsc --noEmit` e `npm run build`.
