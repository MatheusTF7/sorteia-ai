# Plano inicial — PWA de torneios X1 de Mobile Legends

> Reconstrução do planejamento anterior à criação dos scripts, baseada no resumo dos turnos iniciais da conversa. Não é uma transcrição literal. A organização abaixo consolida os objetivos e as propostas registradas, sem incluir as etapas posteriores de extração.

## 1. Objetivo

Desenvolver um aplicativo PWA para organizar torneios individuais (1v1 ou X1) de Mobile Legends: Bang Bang, com sorteios de heróis, regras de duelo, catálogo de personagens e registro de resultados.

## 2. Stack tecnológica

- Quasar Framework.
- Vue 3.
- Pinia para gerenciamento de estado.
- PWA com suporte a cache e utilização offline dos dados locais.
- Arquivos JSON e imagens armazenados localmente, evitando dependência de APIs externas durante a utilização do aplicativo.

## 3. Funcionalidades previstas

### Catálogo de heróis

- Catálogo de todos os heróis do MLBB.
- Identificação por nome e ID consistente.
- Imagens dos personagens.
- Classes, funções e atributos.
- Estatísticas de vitória (Win Rate), escolha (Pick Rate) e banimento (Ban Rate), com identificação da origem dos dados.
- Informações sobre counters e confrontos entre heróis.

### Sorteios de X1

- Sorteio de heróis.
- Sorteio por classe.
- Utilização das informações do catálogo para enriquecer os sorteios.
- Confrontos previamente selecionados ou organizados em presets de duelo.

### Regras e torneios

- Conjuntos de regras para os duelos.
- Organização de torneios X1.
- Registro dos confrontos e resultados.

## 4. Organização dos dados

A proposta inicial é separar os dados em arquivos JSON, de acordo com suas responsabilidades:

| Arquivo | Finalidade proposta |
| --- | --- |
| `heroes.json` | Catálogo de heróis, nomes, identificadores, classes, atributos e referências de imagens. |
| `hero-stats.json` | Estatísticas dos heróis e proveniência dos dados. |
| `matchups.json` | Counters e informações sobre confrontos entre heróis. |
| `duel-presets.json` | Combinações e configurações predefinidas de duelos. |
| `rulesets.json` | Conjuntos de regras aplicáveis aos confrontos. |

Os identificadores dos heróis devem permitir relacionar os diferentes conjuntos de dados sem depender exclusivamente de textos de apresentação.

## 5. Estratégia de obtenção e atualização dos dados

- Obter os dados e imagens dos heróis a partir de fontes identificáveis.
- Consolidar as informações em uma base local estruturada.
- Manter a proveniência das estatísticas.
- Prever um processo separado de ingestão e atualização dos dados, sem depender de consultas externas durante o uso normal do PWA.
- Verificar os direitos de uso e redistribuição das imagens oficiais antes da publicação do aplicativo.

## 6. Direção arquitetural

O catálogo local deve servir como base comum para os módulos de sorteio, confrontos, regras e torneios. O Quasar e o Vue 3 compõem a interface, enquanto o Pinia gerencia o estado da aplicação. O cache offline deve permitir consultar os recursos locais sem depender continuamente de serviços externos.

## 7. Escopo ainda em aberto

O resumo inicial não registra decisões definitivas sobre o formato detalhado dos atributos, algoritmos de balanceamento, regras específicas de X1, formato das chaves de torneio ou mecanismo de persistência dos resultados. Esses pontos permanecem para definição posterior.

---

Este documento encerra-se na fase de planejamento inicial. Não inclui scripts JavaScript, extração de HTML, downloads em lote, compactação ZIP ou implementação do mapeamento de counters por imagem.
