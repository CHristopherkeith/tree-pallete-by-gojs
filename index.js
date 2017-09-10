$(document).ready(function(){
	var treeConfig = {
		renderTo: 'treediagram',
		palleteRenderTo: 'pallete'
	}
	var treeTopo = new Topo(treeConfig);
	treeTopo.nodeDataArray = nodeDataArray;
	treeTopo.linkDataArray = linkDataArray;
	treeTopo.init();

	$('#save').click(function(){
		console.log(JSON.stringify(treeTopo.nodeDataArray,null,2),'nodeDataArray')
		console.log(JSON.stringify(treeTopo.linkDataArray,null,2),'linkDataArray')
	})

	$('#update').click(function(){
		treeTopo.update();
	})
})