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
            name: '',
            label: '',
            property_name: '',
            property: '',
            property2_name: '',
            property2:''
        },
        ifNodeWasSelected: false,

        grafoEncontrado: true,
        msgSeNaoEncontrado: ''
    },
    watch: {
        graph: function(graph, _) {
            console.log(graph);

            // Apaga grafo anterior
            var gs = document.getElementById("graph-view");
            var i = gs.children.length - 1;
            while (i > 0) gs.removeChild(gs.childNodes[i--]);

            // Fecha painel
            hideDetails();

            // Nao existe caminho
            if (graph.nodes.length <= 0) {
                // MOSTRA MSG NAO TEM PATH
                this.grafoEncontrado = false;
                this.msgSeNaoEncontrado = search.msgSeNaoEncontrado;
                return;
            }
            this.grafoEncontrado = true;

            // Tem no, mas eh enzima
            if (graph.links.length <= 0) {
                // Abre detalhes da enzima, quando lista estiver pronta
                setTimeout(function() {
                    showDetails(0);
                }, 0);
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
                .attr("refX", 17)
                .attr("refY", -2)
                .attr("markerWidth", 15)
                .attr("markerHeight", 15)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-4L8,-2L1,02");

                
            // Imagem no background do no
            /*this.svg.append("defs").selectAll("marker")
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
                .attr("xlink:href", function(d) {
                    if (d.label.indexOf("Enzyme") >= 0) {
                        return "img/enzima.png";
                    } else if (d.label.indexOf("Compound") >= 0) {
                        return "https://www.kegg.jp/Fig/compound/" + d.property + ".gif";
                    }
                    return "";
                });*/

            /*
            this.svg.append("defs")
                .append("clipPath")
                .attr("id", "clipText")
                .append("rect")
                .attr("width", 40)
                .attr("height", 40);
                */

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
                .attr("r", 20)
                .attr("class", function(d) {return "node" + d.label;})
                .attr("onclick", function(d) {return "showDetails(" + d.index + ")"})
                .call(d3.drag()
                        .on("start", this.dragstarted)
                        .on("drag", this.dragged)
                        .on("end", this.dragended));

            this.text = this.svg.append("g").selectAll("text")
                .data(graph.nodes)
                .enter()
                .append("text")
                //.attr("clip-path", "url(#clipText)")
                .attr("x", function(d) {
                    if (d.label != "Enzyme") {
                        if (d.name.length > 20) return "-45";
                        else return -2.5 * d.name.length; // centraliza texto
                    } else {
                        return -2.5 * d.property.length;
                    }
                })
                .attr("y", 25)
                .text(function(d) {
                    if (d.label == "Enzyme")
                        return d.property;
                    
                    if (d.name.length <= 17) return d.name;
                    else return d.name.slice(0, 17) + "..." });
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
                dr = Math.sqrt(dx * dx + dy * dy) + 300;
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
    graph_div.ifNodeWasSelected = false;
    graph_div.selectedNode = {};
    document.getElementById("msgs-painel").style.display = "none";
    document.getElementById("node-label").style.width = "16px";
}
