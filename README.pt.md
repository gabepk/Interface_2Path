Português/[English](https://gitlab.com/gabepk.ape/Interface_2Path/blob/master/README.md)

# O Banco de Dados 2Path

[2Path](http://www.biomol.unb.br/2pat) é um banco de dados (Neo4j) de uma família de redes metabólicas de terpenóides, criada sob demanda a partir de um workflow público para a reconstrução da rede metabolica *in silico*.

O propósito deste projeto é servir como interface para o banco de dados, de forma que o usuário seja capaz de pesquisar por uma enzima específica e por um caminho metabólico entre dois compostos.

# Banco de dados NoSQL

Bancos de dados NoSQL são uma alternativa ao modelo relacional tradicional para manipular grande número de dados de maneira eficiente. Quando o modelo relacional começou a 
enfrentar prblemas relacionados a escalabilidade e concorrência, os modelos não relacionais trouxeram flexibilidade em diferentes formatos, tais como chave-valor, documento, grafos, etc.
Cada formato possui suas características, vantagens e desvantages.

O 2Path foi construído como um banco de dados NoSQL, mais especificamente um formato de grafo, por conta da grande quantidade de dados biológicos que possui.

# Bando de dados em grafo

Este tipo de banco é focado não só nos dados, mas também nas relações entre eles, uma vez que as conexões são armazenadas junto com os dados no modelo. Portanto, fica muito 
mais simples aplicar um algoritmo de travessia em grafo para buscar um dado específico (nó) ou um caminho entre dois dados (nós). Se fôssemos buscar a mesma informação de 
maneira parecida em um banco de dados relacional, precisaríamos realizar várias operações de JOIN para localizar um conjunto de dados específico por entre as relações de 
Many-to-One e Many-to-Many.

O 2path foi construído como um banco de dados em grafo, utilizando o Neo4j mais especificamente, porque um dos seus objetivos é justamente buscar pelo menor caminho entre 
dois compostos biológicos em um organismo, e este caminho pode conter inúmeros outros compostos. Em outras palavras, é como se estivéssemos buscando a história de um composto 
biológico.

# Neo4j

O Neo4j é um banco de dados em grafo bastante intuitivo, com sua própria linguague query chamada Cypher. Seu modelo possui basicamente suas estruturas: o nó e aresta. Os nós 
podem ter atributos do tipo chave-valor, labels e um conjunto de possíveis tipos de arestas. As arestas também podem possuir labels e um conjunto de possível nós de entrada e de saída.
 Estes são algumas as queries em Cypher que foram usadas neste projeto:
 
* `"MATCH (c:Compound) WHERE toLower(c.compoundName) CONTAINS toLower(" + compostoSTR + ") RETURN c LIMIT 20"`
  * Encontra no máximo 20 compostos que contém a string `compostoSTR` em seu atributo chamado `compoundName`;
* `"MATCH q=(t:Taxonomy)-[*]->(e:Enzyme) WHERE t.taxId =  + this.organismoSelecionado.id +  AND e.enzymeEC =  + this.enzimaSelecionada + " RETURN e"`
  * Encontra uma enzima a qual possui pelo menos uma conexão (com 0 ou mais nós entre eles) com uma taxonomia específica, tal que o número EC desta enzima deve ser 
    igual ao valor da variável `this.enzimaSelecionada`; 
* `"MATCH q=SHORTESTPATH((n1:Compound)-[*]->(n2:Compound)) WHERE ID(n1) = " + this.compostoOrigem.id + " AND ID(n2) = " + this.compostoFinal.id + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links"`
  * Encontra o menor caminho entre dois compostos específicos e retorna um grafo sem nós repetidos, onde os nós são chamados de "nodes" e as arestas de "links" no retorno da query.

# Publicações (Interface do 2Path)

Nós utilizamos o Método de Avaliação de Comunicabilidade para medir a qualidade da interface a partir da perspectiva do usuário. A pesquisa foi submetida e aceita como um full paper pelo World Conference on Information Systems and Tecnologies (WorldCist) in 2018.

[Esteves, G., Silva, W., Walter, M. E., Brigido, M., & Lima, F. (2018). Human-Computer Interaction Communicability Evaluation Method Applied to Bioinformatics. In World Conference on Information Systems and Technologies (pp. 1001-1008). Springer.](https://link.springer.com/chapter/10.1007/978-3-319-77712-2_95)