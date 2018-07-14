var graph = new Vue({
    el: '#graph',
    data: {
        graphResult: {nodes: [], links: []}
    },
    watch: {
        graphResult: function(graph, _) {
            console.log(graph);
        }
    },
    methods: {
        montaGrafico() {
            
        }
    }
});