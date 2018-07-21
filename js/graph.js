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
        text: ''
    },
    watch: {
        graph: function(graph, _) {
            console.log(graph);

            // Apaga grafo anterior
            var gs = document.getElementById("graph-view");
            var i = gs.children.length - 1;
            while (i > 0) gs.removeChild(gs.childNodes[i--]);

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
                        .distance(150)
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
                .attr("refX", /*15*/35)
                .attr("refY", /*-1.5*/-10)
                .attr("markerWidth", 15)
                .attr("markerHeight", 15)
                .attr("orient", "auto")
                .append("path")
                .attr("d", /*"M0,-2L5,0L0,02"*/"M0,-4L8,-4L2,02");

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
                .append("svg:image")
                .attr("xlink:href", function(d) {
                    if (d.label.indexOf("Compound") >= 0)
                        return "https://www.kegg.jp/Fig/compound/" + d.property + ".gif";
                    else
                        return "http://www.soscentroeletronico.com.br/images/raio.svg"
                })
                .attr("x", "-50")
                .attr("width", "100")
                .attr("class", function(d) {return "node" + d.label;})
                /*.attr("onmouseover", function(d) {
                    return "showLabels(this, \""+ d.label+"\",\""+d.name+"\",\""+d.property+"\");"})
                .attr("onmouseout", function(d) {
                    return "clearLabels(this, \""+ d.cor+"\")"})*/
                .call(d3.drag()
                        .on("start", this.dragstarted)
                        .on("drag", this.dragged)
                        .on("end", this.dragended));
            
            /*this.circle.append("title")
                .text(function(d) { return d.property; });*/

            /*this.text = this.svg.append("g").selectAll("text")
                .data(graph.nodes)
                .enter()
                .append("text")
                .attr("x", -20)
                .attr("y", ".31em")
                .text(function(d) {return d.property;});*/
        },
    },
    methods: {
        showLabels(e, label, name, property) { // TODO MELHORAR
            // Mostra propriedades em um campo da página
            e.style.fill = "#55a";
            var nodeLabel = document.getElementById("node-label");	
            nodeLabel.innerHTML = 
                "<h3><b>" + label.substring(0, label.length - 1) +
                "</b></h3><h4><b>Nome</b>: " + name +
                "<br/><b>ID: </b>: " + property + "</h4>";
        },
        clearLabels(e, cor) { // TODO MELHORAR
            e.style.fill = cor;
        },
        tick() {
            this.path.attr("d", this.linkArc);
            this.circle.attr("transform", this.transform);
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
        }
    },
    created: function() {
        
    }
});