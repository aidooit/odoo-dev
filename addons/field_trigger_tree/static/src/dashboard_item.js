/** @odoo-module **/

import { loadJS, loadCSS } from "@web/core/assets";
import { Component, onWillStart, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class DashboardItem extends Component {
    static template = "field_trigger_tree.DashboardItem"
    static props = {
        model_name: { type: String, optional: true },
        field_name: { type: String, optional: true },
    };

    setup() {
        this.modelName = this.props.model_name;
        this.fieldName = this.props.field_name;
        this.data = {};
        this.sourceField = "";
        this.rpc = useService("rpc");

        onWillStart(async () => {
            await loadJS("/field_trigger_tree/static/lib/D3/d3.v7.min.js");
            await loadCSS("/field_trigger_tree/static/src/dashboard_item.css");
            await this.rpc(
                "/field_trigger_tree", 
                { 
                    model_name: this.modelName,
                    field_name: this.fieldName
                }
            ).then(res => {
                this.data = res.trigger_tree;
                this.sourceField = res.source_field;
            }).catch(err => {
                console.error("Error fetching data:", err);
            });
        });
        onMounted(() => {
            this.initializeVisualization();
        });
    }

    initializeVisualization() {
        let d3 = window.d3;
        if (!d3) {
            console.error("D3 library not loaded!");
            return;
        }
        
        const graphElement = d3.select("#graph");
        if (graphElement.empty()) {
            console.error("Graph element #graph not found!");
            return;
        }
        
        graphElement.selectAll("*").remove();

        // Get the actual container dimensions
        const container = document.getElementById('graph');
        const containerRect = container.getBoundingClientRect();
        const width = Math.max(800, containerRect.width || window.innerWidth * 0.9);
        const height = Math.max(600, containerRect.height || window.innerHeight - 200);
        
        const svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("width", "100%")
            .style("height", "100%");

        const g = svg.append("g").attr("transform", "translate(40, 40)");

        // Convert trigger tree to hierarchical levels with proper connections
        const {levels, connections} = this.convertToLevelsWithConnections(this.data, this.sourceField);
        
        // Calculate layout with more space
        const levelWidth = (width - 160) / levels.length; // More margin for full screen
        const itemHeight = 25; // Slightly more space between items

        // Draw level labels
        levels.forEach((level, levelIndex) => {
            const x = levelIndex * levelWidth + levelWidth / 2;
            g.append("text")
                .attr("class", "level-label")
                .attr("x", x)
                .attr("y", 15)
                .text(level.label);
        });

        // Create position map for all items
        const itemPositions = new Map();

        levels.forEach((level, levelIndex) => {
            const x = levelIndex * levelWidth + 80; // More left margin
            
            level.items.forEach((item, itemIndex) => {
                const y = 80 + (itemIndex * itemHeight); // More top margin
                
                itemPositions.set(item.id, {
                    x: x,
                    y: y,
                    levelIndex: levelIndex,
                    itemIndex: itemIndex
                });
                
                // Draw field circle
                g.append("circle")
                    .attr("class", `field-circle ${item.type}`)
                    .attr("cx", x - 10)
                    .attr("cy", y)
                    .attr("r", 3);
                
                // Draw field text
                g.append("text")
                    .attr("class", `field-node ${item.type}`)
                    .attr("x", x)
                    .attr("y", y + 3)
                    .text(item.name);
            });
        });
        
        // Draw connection lines
        connections.forEach(conn => {
            const sourcePos = itemPositions.get(conn.source);
            const targetPos = itemPositions.get(conn.target);
            
            if (sourcePos && targetPos) {
                const sourceX = sourcePos.x + conn.sourceName.length * 6;
                const sourceY = sourcePos.y;
                const targetX = targetPos.x - 10;
                const targetY = targetPos.y;
                
                // Draw curved line
                const path = d3.path();
                const midX = (sourceX + targetX) / 2;
                
                path.moveTo(sourceX, sourceY);
                path.bezierCurveTo(
                    midX, sourceY,
                    midX, targetY,
                    targetX, targetY
                );
                
                g.append("path")
                    .attr("class", "connection-line")
                    .attr("d", path.toString());
            } else {
                console.warn('Missing position for connection:', conn);
            }
        });
    }

    convertToLevelsWithConnections(triggerTree, sourceField) {
        const levels = [];
        const connections = [];
        let idCounter = 0;
        
        // Level 0: Source Field
        const sourceId = `source-${idCounter++}`;
        levels.push({
            label: "Source Field",
            items: [{
                id: sourceId,
                name: sourceField || "Source",
                type: "source"
            }]
        });

        // Level 1: Direct Dependencies (root fields)
        const rootFieldIds = {};
        if (triggerTree.root && triggerTree.root.length > 0) {
            const rootItems = triggerTree.root.map(field => {
                const fieldId = `root-${idCounter++}`;
                rootFieldIds[field] = fieldId;
                
                // Add connection from source to this root field
                connections.push({
                    source: sourceId,
                    target: fieldId,
                    sourceName: sourceField || "Source"
                });
                return { id: fieldId, name: field, type: "target"};
            });
            
            levels.push({ label: "Direct Dependencies", items: rootItems});
        }

        // Level 2: Relationship Fields (if any children exist)
            const relationshipIds = {};
            if (triggerTree.children && Object.keys(triggerTree.children).length > 0) {
                const relationshipItems = [];
                
                Object.entries(triggerTree.children).forEach(([relName, relData]) => {
                    const relId = `rel-${idCounter++}`;
                    relationshipIds[relName] = relId;
                    
                    // Add connection from source to relationship
                    connections.push({
                        source: sourceId,
                        target: relId,
                        sourceName: sourceField || "Source"
                    });
                    
                    relationshipItems.push({
                        id: relId,
                        name: relName,
                        type: "relationship"
                    });
                });
                
                levels.push({ label: "Relationships", items: relationshipItems });
                
                // Level 3: Related Fields (fields affected through relationships)
                const relatedItems = [];
                Object.entries(triggerTree.children).forEach(([relName, relData]) => {
                    const relId = relationshipIds[relName];
                    
                    if (relData.root) {
                        relData.root.forEach(field => {
                            const fieldId = `related-${idCounter++}`;
                            
                            // Add connection from relationship to related field
                            connections.push({
                                source: relId,
                                target: fieldId,
                                sourceName: relName
                            });
                            
                            relatedItems.push({
                                id: fieldId,
                                name: field,
                                type: "target",
                                relationship: relName
                            });
                        });
                    }
                });
                
                if (relatedItems.length > 0) {
                    levels.push({ label: "Related Fields", items: relatedItems });
                }
            }
            return { levels, connections };
    }
}