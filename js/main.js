Vue.use(VAutocomplete.default)

var search = new Vue({
    el: '#search',
    data: {
        organismoLista: [],
        organismoListaFiltrada: [],
        organismoSelecionado: 0,

        enzimaLista: [],
        enzimaSelecionada: '',

        compostoOrigemLista: [],
        compostoOrigemSelecionado: '',
        compostoOrigemFoiEscolhido: false,

        compostoFinalLista: [],
        compostoFinalSelecionado: '',
        compostoFinalFoiEscolhido: false
    },
    watch: {
        compostoOrigemSelecionado: function(composto, _) {
            var vm = this;
            this.compostoOrigemLista = [];
            if(!this.compostoOrigemFoiEscolhido) {
                if (composto.length > 2) {
                    // Constroi query
                    var body = {};
                    body["query"] = "MATCH (c:Compound) WHERE c.compoundName =~ \"(?i).*" + 
                    composto + ".*\" RETURN c LIMIT 20";

                    // Busca compostos na API para autocomplete
                    axios.post("http://localhost:7474/db/data/cypher", body)
                    .then(response => {
                        for(var i=0; i<response.data.data.length; i++) {
                            var compostosRaw = response.data.data[i][0];
                            if (compostosRaw) {
                                var composto = compostosRaw.data;
                                composto.id = compostosRaw.metadata.id;
                                vm.compostoOrigemLista.push(composto);
                            }
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            } else {
                this.compostoOrigemFoiEscolhido = false;
            }
        },
        compostoFinalSelecionado: function(composto, _) {
            var vm = this;
            this.compostoFinalLista = [];
            if(!this.compostoFinalFoiEscolhido) {
                if (composto.length > 2) {
                    // Constroi query
                    var body = {};
                    body["query"] = "MATCH (c:Compound) WHERE c.compoundName =~ \"(?i).*" +
                    composto + ".*\" RETURN c LIMIT 20";

                    // Busca compostos na API para autocomplete
                    axios.post("http://localhost:7474/db/data/cypher", body)
                    .then(response => {
                        for(var i=0; i<response.data.data.length; i++) {
                            var compostosRaw = response.data.data[i][0];
                            if (compostosRaw) {
                                var composto = compostosRaw.data;
                                composto.id = compostosRaw.metadata.id;
                                vm.compostoFinalLista.push(composto);
                            }
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            }
            else {
                this.compostoFinalFoiEscolhido = false;
            }
        }
    },
    methods: {
        populaListaOrganismos() {
            var vm = this;

            // Inicia download

            // Constroi query
            var body = {};
            body["query"] = "MATCH (t:Taxonomy) RETURN t.taxId, t.taxName"; // TODO Tirar limite

            axios.post("http://localhost:7474/db/data/cypher", body)
            .then(response => {
                var n = response.data.data.length;

                vm.organismoLista = [];
                for(var i=0; i<n; i++) {
                    var organismo = {id: '', nome: ''};
                    organismo.id = response.data.data[i][0];
                    organismo.nome = response.data.data[i][1];
                    vm.organismoLista.push(organismo);
                }

                // Ordena lista de acordo com nome
                vm.organismoLista.sort(function(o1, o2) {
                    return o1.nome.localeCompare(o2.nome);
                });

            }).catch(function(error) {
                console.log(error);
            }).finally(function(){
                // Termina download
            });
        },
        showSearchEnzyme() {
            document.getElementById("search-pathway-menu").style.display = "none";
            document.getElementById("search-enzyme-menu").style.display = "flex";
        },
        showSearchPathway() {
            document.getElementById("search-enzyme-menu").style.display = "none";
            document.getElementById("search-pathway-menu").style.display = "flex";
        },
        searchEnzyme() {
            // Constroi query
            var body = {};
            if (this.organismoSelecionado == 0) {
                body["query"] = "MATCH q=(e:Enzyme) WHERE e.enzymeEC = \"" + this.enzimaSelecionada + "\"  RETURN DISTINCT(nodes(q)) as nodes";
            } else {
                body["query"] = "MATCH q=(t:Taxonomy)-[*]->(e:Enzyme) WHERE t.taxId = \"" + this.organismoSelecionado + 
                    "\" AND e.enzymeEC = \"" + this.enzimaSelecionada + "\" RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";
            }

            this.search(body)
        },
        searchPathway() {
            /*if (!this.compostoOrigemFoiEscolhido) {
                return;
            } else if (!this.compostoFinalFoiEscolhido) {
                return;
            }*/

            // FROM UDP; Uridine 5'-diphosphate
            // TO Dihydrozeatin riboside

            // Constroi query
            var body = {};
            if (this.organismoSelecionado == 0) {
                body["query"] =  "MATCH q=(c1:Compound)-[:SUBSTRATE_FOR|PRODUCT_OF*]->(c2:Compound) WHERE ID(c1) = "
                + this.compostoOrigemSelecionado + " AND ID(c2) = " + this.compostoFinalSelecionado
                + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";
            } else {
                body["query"] = "MATCH q=(t:Taxonomy)-[*]->(c1:Compound)-[:SUBSTRATE_FOR|PRODUCT_OF*]->(c2:Compound) WHERE " + 
                "t.taxId = \"" + this.organismoSelecionado + "\" AND ID(c1) = "
                + this.compostoOrigemSelecionado + " AND ID(c2) = " + this.compostoFinalSelecionado
                + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";
            }

            this.search(body)
        },
        search(body) {
            var vm = this;

            // Inicia busca

            axios.post("http://localhost:7474/db/data/cypher", body)
            .then(response => {
                var nodes = [];
                var links = [];

                if (response.data.data.length > 0) {
                    var nodesRaw = response.data.data[0][0];
                    if (nodesRaw) {
                        for (var i=0; i<nodesRaw.length; i++) {
                            var node = nodesRaw[i].data;
                            node.id = nodesRaw[i].metadata.id;
                            node.label = nodesRaw[i].metadata.labels[0];
                            nodes.push( vm.parseNode(node) );
                        }
                    }

                    var linksRaw = response.data.data[0][1];
                    if(linksRaw) {
                        for (var i=0; i<linksRaw.length; i++) {
                            var link = {start: '', end: '', type: ''};
                            var startURL = linksRaw[i].start.split("/");
                            link.source = startURL[startURL.length - 1];
                            var endURL = linksRaw[i].end.split("/");
                            link.target = endURL[endURL.length - 1];
                            link.type = linksRaw[i].type;
                            link.id = linksRaw[i].metadata.id;
                            links.push(link);
                        }
                    }
                }

                // Atualiza grafico
                graph_div.graph = {nodes: nodes, links: links};

            }).catch(function(error) {
                console.log(error);
                graph_div.graph = {nodes: [], links: []};
            }).finally(function(){
                // Termina busca
            });
        },
        selecionaCompostoOrigem(composto) {
            this.compostoOrigemSelecionado = composto.id;
            this.compostoOrigemFoiEscolhido = true;
        },
        selecionaCompostoFinal(composto) {
            this.compostoFinalSelecionado = composto.id;
            this.compostoFinalFoiEscolhido = true;
        },
        parseNode(node) {
            switch (node.label) {
                case "Compound":
                    node["name"] = node.compoundName;
                    node["property_name"] = "compoundKEGG";
                    node["property"] = node.compoundKEGG;
                    node["property2_name"] = "compoundChebi";
                    node["property2"] = node.compoundChebi;
                    node["color"] = "#7f7";

                    delete node.compoundName;
                    delete node.compoundKEGG;
                    delete node.compoundChebi;
                    break;
                case "Enzyme":
                    node["name"] = node.enzymeName;
                    node["property_name"] = "enzymeEC";
                    node["property"] = node.enzymeEC;
                    node["property2_name"] = "";
                    node["property2"] = "";
                    node["color"] = "#ff7";

                    delete node.enzymeName;
                    delete node.enzymeEC;

                    break;
                case "Reaction":
                    node["name"] = node.reactionDescription;
                    node["property_name"] = "reactionKEGG";
                    node["property"] = node.reactionKEGG;
                    node["property2_name"] = "reactionRefs";
                    node["property2"] = node.reactionRefs;
                    node["color"] = "#f77";

                    delete node.reactionDescription;
                    delete node.reactionKEGG;
                    delete node.reactionRefs;
                    break;
                default:
                    break;
            }

            return node;
        },
    },
    created() {
        axios.defaults.headers.common['Authorization'] = "Basic bmVvNGo6YWRtaW4=";
        this.populaListaOrganismos();
    }
});