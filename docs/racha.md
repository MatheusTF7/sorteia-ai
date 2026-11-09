# Gerenciador de racha

Acesse **Meu racha** no menu ou na tela inicial (`#/racha`). O módulo mantém um racha atual, salvo no `localStorage` deste navegador, na chave `sorteia-ai-racha-v1`. Não há sincronização entre dispositivos.

As mudanças são gravadas imediatamente: jogadores, funções, pagamentos, detalhes, configuração e resultado do sorteio. A página também restaura nomes ainda não adicionados, busca, filtro, detalhes abertos e rascunho de edição de um jogador. Recarregar ou fechar o aplicativo não exige salvar manualmente. Rachas salvos em versões anteriores continuam compatíveis.

## Jogadores e pagamentos

- Adicione nomes separados por vírgula, ponto e vírgula ou quebra de linha. A importação de listas salvas adiciona nomes sem substituir a lista atual ou suas marcações.
- Nomes repetidos são ignorados, considerando maiúsculas, espaços e Unicode normalizado. Use apelidos diferentes para pessoas com o mesmo nome.
- Cada jogador tem marcações independentes de goleiro, cabeça de chave e pagamento. Marcar goleiro também o torna cabeça de chave automaticamente.
- A busca e os filtros afetam apenas a visualização. Todos os jogadores, inclusive os pendentes de pagamento, participam do sorteio.
- O valor por jogador, opcional nos detalhes do racha, permite calcular recebido e a receber. Os valores são calculados em centavos.

## Atualização para WhatsApp

Use **Lista para WhatsApp**, ao lado de **Importar lista**, para abrir a prévia e **Copiar mensagem**. A mensagem contém nome do racha, local, data e valor quando preenchidos, lista numerada com goleiros e outros cabeças de chave, status de pagamento individual e resumo de pagamentos. Com valor definido, também inclui recebido e a receber.

A exportação usa a lista completa, independentemente da busca e dos filtros. Funciona antes do sorteio e não cria nem altera os times. A mensagem é copiada para você colar no grupo; o aplicativo não envia mensagens automaticamente.

## Sorteio

- **Por tamanho:** o tamanho máximo inclui o goleiro. A quantidade de times é o maior valor entre o número necessário para acomodar os jogadores e o total de cabeças de chave.
- **Por cabeças de chave:** cria um time por cabeça de chave, incluindo goleiros, e distribui todos os jogadores. Exige pelo menos dois cabeças de chave.
- Cada goleiro ou outro cabeça de chave fica em um time diferente. Quem possui as duas marcações conta uma única vez.
- Os demais jogadores são embaralhados e distribuídos entre os menores times. A diferença de tamanho é de, no máximo, uma pessoa. O sorteio não avalia habilidade dos demais jogadores.
- Se faltarem goleiros para a quantidade de times, a página avisa e permite o sorteio.
- A saída, opcional, é sorteada entre os jogadores dos times de maior tamanho, seguindo o critério da página de sorteio de times existente.

Alterar jogadores, funções ou configuração da divisão limpa os times anteriores. Editar nomes, pagamentos ou detalhes do racha preserva a formação. Desativar o sorteio da saída limpa somente quem dá a saída.

O resultado e as marcações são restaurados ao reabrir a página. **Copiar times** copia nomes, funções, detalhes preenchidos e saída para compartilhar. **Novo racha** pede confirmação antes de apagar os dados atuais; não altera as listas de nomes salvas do restante do aplicativo.

## Validação

Execute `npm run test:racha` para testar o algoritmo e a persistência reativa. Os testes cobrem múltiplas quantidades de jogadores, modos, tamanhos e sequências aleatórias, além de restauração, dados inválidos e indisponibilidade do armazenamento.

O teste pode ser executado sem subprocessos em ambientes restritos com `node --test --test-isolation=none tests/racha.test.mjs` (Node 22 ou superior).
