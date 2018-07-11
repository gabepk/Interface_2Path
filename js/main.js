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
                    body["query"] = "MATCH (n:Compound) WHERE n.compoundName =~ '(?i).*" + componente + ".*' RETURN n LIMIT 20";
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
                    body["query"] = "MATCH (n:Compound) WHERE n.compoundName =~ '(?i).*" + componente + ".*' RETURN n LIMIT 20";
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
            body["query"] = "MATCH (n:SubCellularLocation) RETURN n LIMIT 25"; // TODO Tirar limite

            axios.post("http://localhost:7474/db/data/cypher", body)
            .then(response => {
                console.log(response.data);
                var n = response.data.data.length;

                vm.organismoLista = [];
                for(var i=0; i<n; i++) {
                    var organismo = {id: '', nome: ''};
                    organismo.id = response.data.data[i][0].metadata.id;
                    organismo.nome = response.data.data[i][0].data.subCellularLocationAlias;
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