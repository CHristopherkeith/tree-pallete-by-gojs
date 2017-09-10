var Topo = function(topoConfig){
  this.renderTo = topoConfig.renderTo;
  this.palleteRenderTo = topoConfig.palleteRenderTo;
  this.myDiagram = null;
  this.nodeDataArray = null;
  this.linkDataArray = null;
}
Topo.prototype = {
  init: function(){
    var self = this;
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    function finishDrop(e, grp) {
      // console.log(e)
      // console.log(grp)
      // console.log(e.diagram.selection)
      // var ok = (grp !== null
      //           ? grp.addMembers(grp.diagram.selection, true)
      //           : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
      // console.log(ok)
      // if (!ok) e.diagram.currentTool.doCancel();
      if(grp !== null){
        // console.log(grp.diagram.selection.pd)
        var selection = grp.diagram.selection.pd;
        for(var k in selection){
            // console.log(selection[k].value.data);
            // selection[k].value.data.key = 22333;
            selection[k].value.data.group = -1;
        }
        // debugger
        // console.log(grp.diagram.selection.Qb.Wa.data)
        var newData = selection[k].value.data;
        newData.key += new Date().toString();
        this.linkDataArray.push({
          from: 0,
          to: newData.key
        })

        // grp.addMembers(grp.diagram.selection, true)
        console.log(newData)
        
        // this.nodeDataArray.push(newData)
        console.log(this.nodeDataArray)
        console.log(this.linkDataArray)
        console.log(e.isTransactionFinished)
        if (e.isTransactionFinished){
          self.update();
        }
        // this.myDiagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);
        // console.log(this.nodeDataArray)
      }else{
        e.diagram.currentTool.doCancel();
      }
    }

    this.myDiagram =
      $(go.Diagram, this.renderTo,
        {
          allowDrop: true,
          // mouseDrop: function(e) { console.log(arguments);finishDrop(e, null); },  
          "commandHandler.copiesTree": true,
          "commandHandler.deletesTree": true,
          // newly drawn links always map a node in one tree to a node in another tree
          "linkingTool.archetypeLinkData": { category: "Mapping" },
          "linkingTool.linkValidation": checkLink,
          "relinkingTool.linkValidation": checkLink,
          initialContentAlignment: go.Spot.Center,
          "undoManager.isEnabled": true,
          "ModelChanged": function(e) {
            if (e.isTransactionFinished) {  // show the model data in the page's TextArea
              // console.log('22');
              // self.update();
            }
          }
        });

    // All links must go from a node inside the "Left Side" Group to a node inside the "Right Side" Group.
    function checkLink(fn, fp, tn, tp, link) {
      // make sure the nodes are inside different Groups
      if (fn.containingGroup === null || fn.containingGroup.data.key !== -1) return false;
      if (tn.containingGroup === null || tn.containingGroup.data.key !== -2) return false;
      //// optional limit to a single mapping link per node
      //if (fn.linksConnected.any(function(l) { return l.category === "Mapping"; })) return false;
      //if (tn.linksConnected.any(function(l) { return l.category === "Mapping"; })) return false;
      return true;
    }

    // var self = this;
    // this.myDiagram.addDiagramListener('ExternalObjectsDropped',function(){
    //   console.log(arguments)
    //   self.update();
    // })

    this.myDiagram.addModelChangedListener(function(evt) {
      // ignore unimportant Transaction events
      if (!evt.isTransactionFinished) return;
      // self.update();
      var txn = evt.object;  // a Transaction
      if (txn === null) return;
      // iterate over all of the actual ChangedEvents of the Transaction
      var isChange = false;
      txn.changes.each(function(e) {
        // ignore any kind of change other than adding/removing a node
        if (e.modelChange !== "nodeDataArray") return;
        // record node insertions and removals
        if (e.change === go.ChangedEvent.Insert) {
          console.log(evt.propertyName + " added node with key: " + e.newValue.key);
          console.log('change')
          isChange = true;
          
          // return false;
        } else if (e.change === go.ChangedEvent.Remove) {
          console.log(evt.propertyName + " removed node with key: " + e.oldValue.key);
        }
      });
      if(isChange){
        self.update();
      }
    });

    // this.myDiagram.addModelChangedListener( "ModelChanged", function(e) {
    //   if (e.isTransactionFinished){
    //     self.update();
    //   }
    // })

    // Each node in a tree is defined using the default nodeTemplate.
    this.myDiagram.nodeTemplate =
      $(TreeNode,
        {
          mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); }
        },
        { movable: true },  // user cannot move an individual node
        // no Adornment: instead change panel background color by binding to Node.isSelected
        { selectionAdorned: false },
        // whether the user can start drawing a link from or to this node depends on which group it's in
        new go.Binding("fromLinkable", "group", function(k) { return k === -1; }),
        new go.Binding("toLinkable", "group", function(k) { return k === -2; }),
        $("TreeExpanderButton",  // support expanding/collapsing subtrees
          {
            width: 14, height: 14,
            "ButtonIcon.stroke": "white",
            "ButtonIcon.strokeWidth": 2,
            "ButtonBorder.fill": "goldenrod",
            "ButtonBorder.stroke": null,
            "ButtonBorder.figure": "Rectangle"
          }),
        $(go.Panel, "Horizontal",
          { position: new go.Point(16, 0) },
          new go.Binding("background", "isSelected", function(s) { return (s ? "lightblue" : "white"); }).ofObject(),
          //// optional icon for each tree node
          $(go.Picture,
           { width: 14, height: 14,
             margin: new go.Margin(0, 4, 0, 0),
             imageStretch: go.GraphObject.Uniform,
             source: "images/50x40.png" },
           new go.Binding("source", "src")),
          $(go.TextBlock,
            new go.Binding("text", "key", function(s) { return "item " + s; }))
        )  // end Horizontal Panel
      );  // end Node

    // These are the links connecting tree nodes within each group.

    this.myDiagram.linkTemplate = $(go.Link);  // without lines

    this.myDiagram.linkTemplate =  // with lines
      $(go.Link,
        {
          selectable: false,
          routing: go.Link.Orthogonal,
          fromEndSegmentLength: 4,
          toEndSegmentLength: 4,
          fromSpot: new go.Spot(0.001, 1, 7, 0),
          toSpot: go.Spot.Left
        },
        $(go.Shape,
          { stroke: "lightgray" }));

    // These are the blue links connecting a tree node on the left side with one on the right side.
    this.myDiagram.linkTemplateMap.add("Mapping",
      $(MappingLink,
        { isTreeLink: false, isLayoutPositioned: false, layerName: "Foreground" },
        { fromSpot: go.Spot.Right, toSpot: go.Spot.Left },
        { relinkableFrom: true, relinkableTo: true },
        $(go.Shape, { stroke: "blue", strokeWidth: 2 })
      ));

    this.myDiagram.groupTemplate =
      $(go.Group, "Auto",
        new go.Binding("position", "xy", go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          deletable: false,
          mouseDrop: finishDrop,
          layout:
            $(go.TreeLayout,
              {
                alignment: go.TreeLayout.AlignmentStart,
                angle: 0,
                compaction: go.TreeLayout.CompactionNone,
                layerSpacing: 16,
                layerSpacingParentOverlap: 1,
                nodeIndent: 2,
                nodeIndentPastParent: 0.88,
                nodeSpacing: 0,
                setsPortSpot: false,
                setsChildPortSpot: false
              })
        },
        $(go.Shape, { fill: "white", stroke: "lightgray" }),
        $(go.Panel, "Vertical",
          { defaultAlignment: go.Spot.Left },
          $(go.TextBlock,
            { font: "bold 14pt sans-serif", margin: new go.Margin(5, 5, 0, 5) },
            new go.Binding("text")),
          $(go.Placeholder, { padding: 5 })
        )
      );

    this.myDiagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);

    // pallete

    var myPalette =
      $(go.Palette, this.palleteRenderTo,
        {
          nodeTemplateMap: this.myDiagram.nodeTemplateMap
          // groupTemplateMap: this.myDiagram.groupTemplateMap,
          // layout: $(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position })
        });
    myPalette.model = new go.GraphLinksModel([
      { text: "lightgreen", color: "#ACE600" },
      { text: "yellow", color: "#FFDD33" },
      { text: "lightblue", color: "#33D3E5" }
    ]);

  },
  update: function(){
    this.myDiagram.model = new go.GraphLinksModel(this.nodeDataArray, this.linkDataArray);
    console.log('update')
  }
}

function TreeNode() {
  go.Node.call(this);
  this.treeExpandedChanged = function(node) {
    if (node.containingGroup !== null) {
      node.containingGroup.findExternalLinksConnected().each(function(l) { l.invalidateRoute(); });
    }
  };
}
go.Diagram.inherit(TreeNode, go.Node);

/** @override */
TreeNode.prototype.findVisibleNode = function() {
  // redirect links to lowest visible "ancestor" in the tree
  var n = this;
  while (n !== null && !n.isVisible()) {
    n = n.findTreeParentNode();
  }
  return n;
};
// end TreeNode

function MappingLink() {
  go.Link.call(this);
}
go.Diagram.inherit(MappingLink, go.Link);

MappingLink.prototype.getLinkPoint = function(node, port, spot, from, ortho, othernode, otherport) {
  var r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft),
                      port.getDocumentPoint(go.Spot.BottomRight));
  var group = node.containingGroup;
  var b = (group !== null) ? group.actualBounds : node.actualBounds;
  var op = othernode.getDocumentPoint(go.Spot.Center);
  var x = (op.x > r.centerX) ? b.right : b.left;
  return new go.Point(x, r.centerY);
};
// end MappingLink