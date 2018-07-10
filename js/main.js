var search = new Vue({
    el: '#search',
    data: {
        funcionarios: [],
        funcionarioBuscado: '',
        dicionarioBlocos: []
    },
    methods: {
        showSearchEnzyme() {
            document.getElementById("search-pathway-menu").style.display = "none";
            document.getElementById("search-enzyme-menu").style.display = "flex";
        },
        showSearchPathway() {
            document.getElementById("search-enzyme-menu").style.display = "none";
            document.getElementById("search-pathway-menu").style.display = "flex";
        }
    }
});