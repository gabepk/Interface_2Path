var graph_div = new Vue({
    el: '#graph-div',
    data: {
        graph: {nodes: [], links: []},
        width: 1024,
        height: 600,
        svg: '',
        simulation: '',
        nodeLabel: '',
        path: '',
        circle: '',
        text: '',

        selectedNode: {
            name: 'GG',
            label: '',
            property_name: '',
            property: '',
            property2_name: '',
            property2:''
        },
        ifNodeWasSelected: false
    },
    watch: {
        graph: function(graph, _) {
            var vm = this;
            console.log(graph);

            // Apaga grafo anterior
            var gs = document.getElementById("graph-view");
            var i = gs.children.length - 1;
            while (i > 0) gs.removeChild(gs.childNodes[i--]);

            // Fecha painel
            this.ifNodeWasSelected = false;
            this.selectedNode = {};
            hideDetails();

            // Nao existe caminho
            if (graph.nodes.length <= 0) {
                // MOSTRA MSG NAO TEM PATH
                return;
            }

            // Tem no, mas eh enzima
            if (graph.links.length <= 0) {
                // MOSTRA MSG QUE EXISTE ENZIMA
                return;
            }

            this.svg = d3.select("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            this.simulation = d3.forceSimulation()
                .force("link", d3.forceLink()
                        .id(function(d) { return d.id; })
                        .distance(250)
                        .strength(1))
                .force("collide",d3.forceCollide(75))
                .force("center", d3.forceCenter(this.width / 2.4, this.height / 2.4));

            this.simulation
                .nodes(graph.nodes)
                .on("tick", this.tick);

            this.simulation.force("link")
                .links(graph.links);
    
            this.svg.append("defs").selectAll("marker")
                .data(
                        ["REACTS_WITH_ENZYME"])
                .enter()
                .append("marker")
                .attr("id", function(d) {return d;})
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 28)
                .attr("refY", -5)
                .attr("markerWidth", 15)
                .attr("markerHeight", 15)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-4L8,-3L1,02");

            this.svg.append("defs").selectAll("marker")
                .data(graph.nodes)
                .enter()
                .append("pattern")
                .attr("id", function(d) {return "pattern_" + d.property})
                .attr("patternUnits", "objectBoundingBox")
                .attr("height", "100%")
                .attr("width", "100%")
                .append("image")
                .attr("preserveAspectRatio", "none")
                .attr("width", "90px")
                .attr("height", "90px")
                .attr("xlink:href", function(d) {return "https://www.kegg.jp/Fig/compound/" + d.property + ".gif"});

            this.path = this.svg.append("g")
                .selectAll("path")
                .data(graph.links)
                .enter()
                .append("path")
                .attr("class", function(d) {
                    return "link " + d.type;
                })
                .attr("marker-end", function(d) {
                    return "url(#" + d.type + ")";});
    
            this.circle = this.svg.append("g")
                .selectAll("image")
                .data(graph.nodes)
                .enter()
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 45)
                .attr("style", function(d) {return "fill: url(#pattern_" + d.property + ")"})
                .attr("class", function(d) {return "node" + d.label;})
                .attr("onclick", function(d) {return "showDetails(" + d.index + ")"})
                .call(d3.drag()
                        .on("start", this.dragstarted)
                        .on("drag", this.dragged)
                        .on("end", this.dragended));
            
            /*this.circle.append("title")
                .text(function(d) { return d.property; });*/

            this.text = this.svg.append("g").selectAll("text")
                .data(graph.nodes)
                .enter()
                .append("text")
                .attr("x", -21)
                .attr("y", 60)
                .text(function(d) {return d.property;});
        },
    },
    methods: {
        clearLabels(e, cor) { // TODO MELHORAR
            e.style.fill = cor;
        },
        tick() {
            this.path.attr("d", this.linkArc);
            this.circle.attr("transform", this.transform);
            this.text.attr("transform", this.transform);
        },
        linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + 
                    "A" + dr + "," + dr + " 0 0,1 " + 
                    d.target.x + "," + d.target.y;
        },
        transform(d) {
            return "translate(" + d.x + "," + d.y + ")";
        },
        dragstarted(d) {
            if (!d3.event.active)
                this.simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },
        dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        },
        dragended(d) {
            if (!d3.event.active)
                this.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        },
        togglePainel() {
            var nodeLabel = document.getElementById("node-label");
            if (nodeLabel && nodeLabel.style.width == "16px") 
                showDetails(-1);
            else hideDetails();
        },
    },
    created: function() {
    }
});

function showDetails(index) {        
    var node = graph_div.graph.nodes[index];
    if (node) {
        graph_div.ifNodeWasSelected = true;
        graph_div.selectedNode = node;
    }
    document.getElementById("node-label").style.width = "250px";
    setTimeout(function() {
        document.getElementById("msgs-painel").style.display = "block";
    }, 500);
    
}

function hideDetails() {
    document.getElementById("msgs-painel").style.display = "none";
    document.getElementById("node-label").style.width = "16px";
}
