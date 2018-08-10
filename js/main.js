var search = new Vue({
    el: '#search',
    data: {
        organismoLista: [],
        organismoSelecionado: {},

        enzimaLista: [],
        enzimaSelecionada: '',

        compostoOrigemLista: [],
        compostoOrigem: {},
        compostoOrigemNome: '',

        compostoFinalLista: [],
        compostoFinal: {},
        compostoFinalNome: '',

        msgSeNaoEncontrado: ''
    },
    watch: {
        enzimaSelecionada: function(enzima, _) {
            document.getElementById("input-enzyme").classList.remove("input-erro");
        },
        compostoOrigemNome: function(composto, _) {
            var vm = this;
            document.getElementById("input-compound-origem-nome").classList.remove("input-erro");

            this.compostoOrigemLista = [];
            if (composto.length > 2) {
                // Constroi query
                var body = {};
                body["query"] = "MATCH (c:Compound) WHERE toLower(c.compoundName) " + 
                    "CONTAINS toLower(\"" + composto + "\") RETURN c LIMIT 20";

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
        },
        compostoFinalNome: function(composto, _) {
            var vm = this;
            document.getElementById("input-compound-final-nome").classList.remove("input-erro");

            this.compostoFinalLista = [];
            if (composto.length > 2) {
                // Constroi query
                var body = {};
                body["query"] = "MATCH (c:Compound) WHERE toLower(c.compoundName) " + 
                    "CONTAINS toLower(\"" + composto + "\") RETURN c LIMIT 20";

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
    },
    methods: {
        populaListaOrganismos() {
            var vm = this;

            // Inicia download
            document.getElementById("search-side-menu").style.display = "none";
            document.getElementById("graph-view").style.display = "none";
            document.getElementById("node-label").style.display = "none";

            // Constroi query
            var body = {};
            body["query"] = "MATCH (t:Taxonomy) RETURN t.taxId, t.taxName";

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
                document.getElementById("search-side-menu").style.display = "flex";
                document.getElementById("graph-view").style.display = "block";
                document.getElementById("node-label").style.display = "block";
                
            });
        },
        showSearchEnzyme() {
            this.verificaOrganismo();
            document.getElementById("search-pathway-menu").style.display = "none";
            document.getElementById("search-enzyme-menu").style.display = "flex";
        },
        showSearchPathway() {
            this.verificaOrganismo();
            document.getElementById("search-enzyme-menu").style.display = "none";
            document.getElementById("search-pathway-menu").style.display = "flex";
        },
        searchEnzyme() {
            this.verificaOrganismo();

            if (!this.enzimaSelecionada) {
                // Zera grafo
                this.msgSeNaoEncontrado = "Please enter the Enzyme EC";
                document.getElementById("input-enzyme").classList.add("input-erro");
                graph_div.graph = {nodes: [], links: []};
                return;
            }

            document.getElementById("input-enzyme").classList.remove("input-erro");

            // Constroi query
            var body = {};
            this.msgSeNaoEncontrado = "⚠ Enzyme " + this.enzimaSelecionada;

            if (this.organismoSelecionado.id == 0) {
                body["query"] = "MATCH (e:Enzyme) WHERE e.enzymeEC = \"" + this.enzimaSelecionada + "\"  RETURN e";
                
                this.msgSeNaoEncontrado += " not found in any organism ⚠"
            } else {
                body["query"] = "MATCH q=(t:Taxonomy)-[*]->(e:Enzyme) WHERE t.taxId = \"" + this.organismoSelecionado.id + 
                    "\" AND e.enzymeEC = \"" + this.enzimaSelecionada + "\" RETURN e";

                this. msgSeNaoEncontrado += " not found on organism " + this.organismoSelecionado.nome + ". ⚠";
            }

            this.search(body, "Enzyme");
        },
        searchPathway() {
            this.verificaOrganismo();

            var seTemErro = false;
            this.msgSeNaoEncontrado = "";

            this.compostoOrigem = {};
            var compostoOrigemSelecionada = document.getElementById("datalist-compound-origem").options;
            if (compostoOrigemSelecionada.length == 1|| 
                (compostoOrigemSelecionada[0] && compostoOrigemSelecionada[0].value == this.compostoOrigemNome)) {
                this.compostoOrigem.id = compostoOrigemSelecionada[0].getAttribute("data-id");
                this.compostoOrigem.nome = compostoOrigemSelecionada[0].value;
                document.getElementById("input-compound-origem-nome").classList.remove("input-erro");
            } else {
                seTemErro = true;
                this.msgSeNaoEncontrado += " Please select the origin compound. ";
                document.getElementById("input-compound-origem-nome").classList.add("input-erro");
            }

            this.compostoFinal = {};
            var compostoFinalSelecionada = document.getElementById("datalist-compound-final").options;

            // Seleciona composto se ele eh o unico da lista ou
            // se o primeiro da lista tem o mesmo nome
            if (compostoFinalSelecionada.length == 1 || 
                    (compostoFinalSelecionada[0] && compostoFinalSelecionada[0].value == this.compostoFinalNome)) {
                this.compostoFinal.id = compostoFinalSelecionada[0].getAttribute("data-id");
                this.compostoFinal.nome = compostoFinalSelecionada[0].value;
                document.getElementById("input-compound-final-nome").classList.remove("input-erro");
            } else {
                seTemErro = true;
                this.msgSeNaoEncontrado += " Please select the final compound. ";
                document.getElementById("input-compound-final-nome").classList.add("input-erro");
            }

            if (seTemErro) {
                // Zera grafo
                graph_div.graph = {nodes: [], links: []};
                return;
            }

            // Constroi query
            var body = {};
            this.msgSeNaoEncontrado = "⚠ Pathway from " + this.compostoOrigem.nome + " to " + this.compostoFinal.nome;

            if (this.organismoSelecionado.id == 0) {
                body["query"] = "MATCH q=SHORTESTPATH((n1:Compound)-[*]->(n2:Compound)) WHERE ID(n1) = "
                + this.compostoOrigem.id +" AND ID(n2) = "+ this.compostoFinal.id
                + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";

                this.msgSeNaoEncontrado += " not found in any organism ⚠";
            } else {
                body["query"] = "MATCH q=SHORTESTPATH((t:Taxonomy)-[*]->(n1:Compound)-[*]->(n2:Compound)) WHERE "
                + "t.taxId = \"" + this.organismoSelecionado.id + "\" ID(n1) = "
                + this.compostoOrigem.id +" AND ID(n2) = "+ this.compostoFinal.id
                + " RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";

                this.msgSeNaoEncontrado += " not found on organism " + this.organismoSelecionado.nome + " ⚠";
            }

            this.search(body, "Pathway");
        },
        search(body, type) {
            var vm = this;

            // Inicia busca
            document.getElementById("loader-graph").style.display = "block";

            axios.post("http://localhost:7474/db/data/cypher", body)
            .then(response => {
                var nodes = [];
                var links = [];

                if (response.data.data.length > 0) {
                    var nodesRaw = [];
                    if (type === "Enzyme") {
                        nodesRaw.push(response.data.data[0][0]);
                    } else if (type === "Pathway") {
                        nodesRaw = response.data.data[0][0];
                    }

                    var reactionsIds = [];
                    if (nodesRaw) {
                        for (var i=0; i<nodesRaw.length; i++) {
                            var node = nodesRaw[i].data;
                            node.id = nodesRaw[i].metadata.id;
                            node.label = nodesRaw[i].metadata.labels[0];

                            // Armazena so as reacoes e nao armazena
                            if (node.label.indexOf("Reaction") >= 0) {
                                reactionsIds.push(node.id.toString());
                                continue;
                            }

                            nodes.push( vm.parseNode(node) );
                        }
                    }

                    var linksRaw = response.data.data[0][1];
                    if(linksRaw) {
                        var compoundSourceMap = [];
                        var compoundTargetMap = [];

                        for (var i=0; i<linksRaw.length; i++) {
                            var startURL1 = linksRaw[i].start.split("/");
                            var source1 = startURL1[startURL1.length - 1];
                            var endURL1 = linksRaw[i].end.split("/");
                            var target1 = endURL1[endURL1.length - 1];

                            // Verifica se target eh reacao
                            if (reactionsIds.indexOf(target1) >= 0) {
                                for (var j=0; j<linksRaw.length; j++) {
                                    var startURL2 = linksRaw[j].start.split("/");
                                    var source2 = startURL2[startURL2.length - 1];
                                    var endURL2 = linksRaw[j].end.split("/");
                                    var target2 = endURL2[endURL2.length - 1];

                                    if (target1 == source2) {
                                        // Cria links de composto para composto direto source1 -> target2
                                        var link = {};
                                        link.source = source1;
                                        link.target = target2;
                                        link.type = "REACTS_WITH_ENZYME";
                                        link.id = linksRaw[i].metadata.id;
                                        links.push(link);
                                    }
                                }
                            }
                        }
                    }
                }

                // Atualiza grafico
                graph_div.graph = {nodes: nodes, links: links};
                
                // Limpa campos
                /*
                vm.enzimaSelecionada = "";
                vm.compostoOrigem = {};
                vm.compostoOrigemNome = "";
                vm.compostoFinal = {};
                vm.compostoFinalNome = "";
                vm.organismoSelecionado = {};   
                document.getElementById("input-organism-nome").value = "";
                */

            }).catch(function(error) {
                console.log(error);
                graph_div.graph = {nodes: [], links: []};
            }).finally(function(){
                // Termina busca
                document.getElementById("loader-graph").style.display = "none";
            });
        },
        verificaOrganismo() {
            var input = document.getElementById("input-organism-nome");

            var organismo = this.organismoLista.find(x => x.nome == input.value);
            if (organismo) {
                this.organismoSelecionado.id = organismo.id;
                this.organismoSelecionado.nome = organismo.nome;
            } else {
                input.value = "";
                this.organismoSelecionado.id = 0;
                this.organismoSelecionado.nome = "";
            }
        },
        selecionaCompostoOrigem(composto) {
            this.compostoOrigem.id = composto.id;
            this.compostoOrigem.nome = composto.compoundName;
            this.compostoOrigemNome = composto.compoundName;
            this.compostoOrigemFoiEscolhido = true;
        },
        selecionaCompostoFinal(composto) {
            this.compostoFinal.id = composto.id;
            this.compostoFinal.nome = composto.compoundName;
            this.compostoFinalNome = composto.compoundName;
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