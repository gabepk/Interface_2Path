var search = new Vue({
    el: '#search',
    data: {
        organismoLista: [],
        organismoSelecionado: 0,

        enzimaLista: [],
        enzimaSelecionada: '',

        componenteOrigemLista: [],
        componenteOrigemSelecionado: '',
        componenteOrigemFoiEscolhido: false,

        componenteFinalLista: [],
        componenteFinalSelecionado: '',
        componenteFinalFoiEscolhido: false
    },
    watch: {
        componenteOrigemSelecionado: function(componente, _) {
            var vm = this;
            this.componenteOrigemLista = [];
            if(!this.componenteOrigemFoiEscolhido) {
                if (componente.length > 2) {
                    // Constroi query
                    var body = {};
                    body["query"] = "MATCH (c:Compound) WHERE c.compoundName =~ '(?i).*" + 
                        componente + ".*' RETURN c.compoundName LIMIT 20";

                    // Busca componentes na API para autocomplete
                    axios.post("http://localhost:7474/db/data/cypher", body)
                    .then(response => {
                        for(var i=0; i<response.data.data.length; i++) {
                            vm.componenteOrigemLista.push(response.data.data[i][0].data.compoundName);
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            } else {
                this.componenteOrigemFoiEscolhido = false;
            }
        },
        componenteFinalSelecionado: function(componente, _) {
            var vm = this;
            this.componenteFinalLista = [];
            if(!this.componenteFinalFoiEscolhido) {
                if (componente.length > 2) {
                    // Constroi query
                    var body = {};
                    body["query"] = "MATCH (c:Compound) WHERE c.compoundName =~ '(?i).*" +
                         componente + ".*' RETURN c.compoundName LIMIT 20";

                    // Busca componentes na API para autocomplete
                    axios.post("http://localhost:7474/db/data/cypher", body)
                    .then(response => {
                        for(var i=0; i<response.data.data.length; i++) {
                            vm.componenteFinalLista.push(response.data.data[i][0].data.compoundName);
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            }
            else {
                this.componenteFinalFoiEscolhido = false;
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
                console.log(response.data);
                var n = response.data.data.length;

                vm.organismoLista = [];
                for(var i=0; i<n; i++) {
                    var organismo = {id: '', nome: ''};
                    organismo.id = response.data.data[i][0];
                    organismo.nome = response.data.data[i][1];
                    vm.organismoLista.push(organismo);
                }

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
            var vm = this;

            // Inicia busca

            // Constroi query
            var body = {};
            if (this.organismoSelecionado == 0) {
                body["query"] = "MATCH (e:Enzyme) WHERE e.enzymeEC = '" + this.enzimaSelecionada + "'  RETURN e";
            } else {
                body["query"] = "MATCH q=(t:Taxonomy)-[*]->(e:Enzyme) WHERE t.taxId = '" + this.organismoSelecionado + 
                    "' AND e.enzymeEC = '" + this.enzimaSelecionada + "' RETURN DISTINCT(nodes(q)) as nodes, relationships(q) as links";
            }

            axios.post("http://localhost:7474/db/data/cypher", body)
            .then(response => {
                var nodesRaw = response.data.data[0][0];
                var nodes = [];
                for (var i=0; i<nodesRaw.length; i++) {
                    nodes.push(nodesRaw[i].data);
                }

                var linksRaw = response.data.data[0][1];
                var links = [];
                for (var i=0; i<linksRaw.length; i++) {
                    var link = {start: '', end: '', type: ''};
                    var startURL = linksRaw[i].start.split("/");
                    link.start = startURL[startURL.length - 1];
                    var endURL = linksRaw[i].end.split("/");
                    link.end = endURL[endURL.length - 1];
                    link.type = linksRaw[i].type;
                    links.push(link);
                }

                // Atualiza grafico
                graph.graphResult = {nodes: nodes, links: links};

            }).catch(function(error) {
                console.log(error);
                graph.graphResult = {};
            }).finally(function(){
                // Termina busca
            });
        },
        searchPathway() {

        },
        selecionaComponenteOrigem(componente) {
            this.componenteOrigemSelecionado = componente;
            this.componenteOrigemFoiEscolhido = true;
        },
        selecionaComponenteFinal(componente) {
            this.componenteFinalSelecionado = componente;
            this.componenteFinalFoiEscolhido = true;
        }
    },
    created() {
        axios.defaults.headers.common['Authorization'] = "Basic bmVvNGo6YWRtaW4=";
        this.populaListaOrganismos();
    }
});