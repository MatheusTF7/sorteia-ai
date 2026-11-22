# Gerenciador de racha

Acesse **Meu racha** no menu ou na tela inicial (`#/racha`). O módulo mantém um racha atual, salvo no `localStorage` deste navegador, na chave `sorteia-ai-racha-v1`. Não há sincronização entre dispositivos.

As mudanças são gravadas imediatamente: jogadores, funções, pagamentos, detalhes, configuração e resultado do sorteio. A página também restaura nomes ainda não adicionados, busca, filtro, detalhes abertos e rascunho de edição de um jogador. Recarregar ou fechar o aplicativo não exige salvar manualmente. Rachas salvos em versões anteriores continuam compatíveis.

## Jogadores e pagamentos

- Adicione nomes separados por vírgula, ponto e vírgula ou quebra de linha. A importação de listas salvas adiciona nomes sem substituir a lista atual ou suas marcações.
- Nomes repetidos são ignorados, considerando maiúsculas, espaços e Unicode normalizado. Use apelidos diferentes para pessoas com o mesmo nome.
- Cada jogador tem marcações independentes de goleiro, cabeça de chave e pagamento. Marcar goleiro também o torna cabeça de chave automaticamente.
- Cada jogador tem peso **Baixo**, **Médio** ou **Alto**, editável na lista. Novos jogadores e jogadores de rachas antigos começam com peso **Médio**. O resultado também mostra o peso de cada jogador.
- A busca e os filtros afetam apenas a visualização. Todos os jogadores, inclusive os pendentes de pagamento, participam do sorteio.
- O valor por jogador, opcional nos detalhes do racha, permite calcular recebido e a receber. Os valores são calculados em centavos.
- O status **Pagamento pendente** identifica quem ainda não pagou; toque para confirmar o pagamento. O filtro usa a mesma indicação explícita.

## Atualização para WhatsApp

Use **Lista para WhatsApp**, ao lado de **Importar lista**, para abrir a prévia e **Copiar mensagem**. A mensagem contém nome do racha, local, data e valor quando preenchidos, lista numerada com goleiros e outros cabeças de chave, status de pagamento individual e resumo de pagamentos. Com valor definido, também inclui recebido e a receber.

A exportação usa a lista completa, independentemente da busca e dos filtros. Funciona antes do sorteio e não cria nem altera os times. A mensagem é copiada para você colar no grupo; o aplicativo não envia mensagens automaticamente.

## Data e horários

Nos detalhes, selecione a **Data**, o **Horário de início** e o **Horário final** pelos seletores de calendário e relógio do Quasar. Ao escolher o início, o fim é preenchido com **1 hora de duração**. Você pode ajustar o fim; mudanças posteriores no início preservam a duração escolhida. Se o horário final for anterior ao inicial, a partida termina no dia seguinte, com indicação na tela e nas mensagens copiadas. Início e fim iguais exibem uma mensagem de validação.

Data e horários são salvos separadamente e aparecem tanto na lista para WhatsApp quanto na cópia dos times. Datas e horas de rachas antigos são migradas, preservando o dia e a hora local e adicionando 1 hora como duração inicial. Alterar os horários preserva os times sorteados.

## Sorteio

- Novos rachas usam **FUT7**, com **7 jogadores por time, incluindo o goleiro**. Há predefinições de futsal (5) e futebol de campo (11), além de configuração personalizada. Editar o tamanho seleciona automaticamente **Personalizado**. Modalidade e tamanho são salvos localmente; tamanhos anteriormente salvos são preservados.
- **Por tamanho:** o tamanho máximo inclui o goleiro. Os primeiros times são completados antes de formar os próximos com os jogadores restantes. Por exemplo, 15 jogadores no FUT7 formam times de **7 + 7 + 1**; 12 jogadores no futsal formam **5 + 5 + 2**. A quantidade de times depende apenas do total de jogadores e do tamanho escolhido.
- **Por cabeças de chave:** cria um time por cabeça de chave, incluindo goleiros, e distribui todos os jogadores. Exige pelo menos dois cabeças de chave.
- Os goleiros são sorteados primeiro, priorizando o Time 1, o Time 2 e depois os demais. Um time posterior não recebe goleiro enquanto um anterior estiver sem, se houver goleiros suficientes.
- Os outros cabeças de chave são distribuídos em seguida, separados quando possível. No modo **Por tamanho**, cabeças de chave excedentes compartilham times para preservar as formações completas. No modo **Por cabeças de chave**, todos ficam em times distintos. Quem possui as duas marcações conta uma única vez.
- O sorteio considera os pesos: **Baixo = 1**, **Médio = 2** e **Alto = 3**. Distribui jogadores de peso alto entre os times quando possível, considerando também os goleiros e cabeças de chave já alocados, e preenche as vagas buscando equilibrar o peso proporcional ao tamanho de cada time. Por exemplo, quatro jogadores de peso alto em três times são distribuídos como **2 + 1 + 1**, quando as vagas e funções permitem. Jogadores com o mesmo peso são embaralhados; o equilíbrio é uma aproximação que respeita as vagas e funções.
- No modo **Por cabeças de chave**, a diferença de tamanho é de, no máximo, uma pessoa. No modo **Por tamanho**, os primeiros times continuam completos e as sobras ficam nos times posteriores.
- Se faltarem goleiros para a quantidade de times, a página avisa e permite o sorteio.
- **Time 1** e **Time 2** são os dois times do jogo inicial. A saída de bola, opcional, é sorteada somente entre esses dois times. O resultado aparece no cartão do time e na cópia dos times; nenhum jogador individual é indicado para a saída.

Alterar jogadores, pesos, funções ou configuração da divisão limpa os times anteriores. Editar nomes, pagamentos ou detalhes do racha preserva a formação. Desativar o sorteio da saída limpa somente a indicação do time que dá a saída.

O resultado e as marcações são restaurados ao reabrir a página. **Copiar times** copia nomes, funções, detalhes preenchidos e saída para compartilhar. **Novo racha** pede confirmação antes de apagar os dados atuais; não altera as listas de nomes salvas do restante do aplicativo.

Resultados antigos que não respeitam as novas regras de tamanho ou prioridade dos goleiros são descartados ao reabrir a página, com aviso para sortear novamente. Jogadores, marcações, pagamentos e detalhes são preservados.
