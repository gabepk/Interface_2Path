English/[Português](https://gitlab.com/gabepk.ape/Interface_2Path/blob/master/README.pt.md)

# The 2Path Database

[2Path](http://www.biomol.unb.br/2pat) is a family of terpenoid metabolic network databases (Neo4j) created on demand from a public workflow for *in silico* metabolic network reconstruction.

The purpose of this project is to work as an interface to the database, so that the user is able to search for specific enzymes and metabolic pathways between compounds.

# NoSQL database

NoSQL databases are an alternative to the tradition RDBMS to handle big data effectively. When relational databases started facing issues related to large scaling and high-concurrency, 
NoSQL database brought flexibility in different sorts of formats, such as key-value, document, graph, etc. Each format has its own characteristics, potentials and drawbacks. 
The 2path was build as a NoSQL database, more specificaly a graph database, due to the large amount of data it contains.

# Graph database

A graph database is focused not only on the data, but also on the relationships, since the connections are stored alongside the data in the model. Therefore, in this kind of 
database, it's much easier to apply a graph traversal algorithm to search for an specific data or a pathway between datas. 
If we were to perform the same in RDBMS, we would have to apply several JOIN operations to locate a desired dataset between Many-to-One or Many-to-Many relationships.
The 2path was build as a graph database, more specificaly a Neo4j DB, because one of its main goal is to search the relationships between two compounds in an organism, which could have 
several other compounds in between. It's like searching for the history of a single compund in one organism.

# Neo4j

Neo4j is an intuitive graph database, with it's own query language called Cypher. Their model have basically nodes and relationships. Nodes can have key-values attributes, labels
and a set o possible relationships.
These are some queries we've used on this interface project:
* `"MATCH (c:Compound) WHERE toLower(c.compoundName) CONTAINS toLower(" + compostoSTR + ") RETURN c LIMIT 20"`
  * Finds at most 20 compounds which contains the string `compostoSTR` in its attribute called `compoundName`
* `"MATCH q=(t:Taxonomy)-[*]->(e:Enzyme) WHERE t.taxId =  + this.organismoSelecionado.id +  AND e.enzymeEC =  + this.enzimaSelecionada + " RETURN e"`
  * Finds an enzyme which has at least one connection with an specific taxonomy, where the enzyme's EC number is exactely the value of the variable `this.enzimaSelecionada`. 
* `"MATCH q=SHORTESTPATH((n1:Compound)-[*]->(n2:Compound)) WHERE ID(n1) = " + this.compostoOrigem.id + " AND ID(n2) = " + this.compostoFinal.id + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links"`
  * Finds a the shortest path between two specifics compunds (with given ids) and return a graph without node repetition, where nodes are labeled as "nodes" and relationships are labeled as "links".



# Publications (2Path Interface)

We've used a Communication Evaluation Method to measure the quality of the interface from the perspective of the users. The research has been submited and accepted as a full paper by the World Conference on Information Systems and Tecnologies (WorldCist) in 2018.

[Esteves, G., Silva, W., Walter, M. E., Brigido, M., & Lima, F. (2018). Human-Computer Interaction Communicability Evaluation Method Applied to Bioinformatics. In World Conference on Information Systems and Technologies (pp. 1001-1008). Springer.](https://link.springer.com/chapter/10.1007/978-3-319-77712-2_95)