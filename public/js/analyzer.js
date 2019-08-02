var indexWorkspace =1;
var sortableTry = false;


$(document).ready(function () {

    //freeze while everything is ready
    $(window).on('load', function() {
        $("#cover").hide();
    });
    
    //console.log(results[0], resultsOneDimension[0])
    singleGraph();
/*
    $(".action-board").sortable({
       placeholder: "ui-state-highlight",
       appendTo: document.body
       //update: function( event, ui ) {}
    });
    $(".action-board").disableSelection();
    $( ".action-board" ).on( "sortchange", function( event, ui ) {
        
        filterGraphics(event.toElement.parentNode.getAttribute('data-idboard'));
    } );
   
    
    $( ".action-board" ).sortable();
    $( ".action-board" ).disableSelection();
     */
    $(".action-board").sortable({
       placeholder: "ui-state-highlight",
      
       appendTo: document.body,
       update: function( event, ui ) {},
       start: function( event, ui ) {}
    });
    $(".action-board").disableSelection();
    $( ".action-board" ).on( "sortupdate", function( event, ui ) {
        event.stopPropagation();
        if(sortableTry){

            filterGraphics(event.target.id);
            sortableTry=false;
        }

    } );
    $( ".action-board" ).on( "sortstart", function( event, ui ) {
        if (!sortableTry)
            sortableTry=true;
            
    } );

    // Get the modal
        var modal = document.getElementById("report");


        // Get the button that opens the modal
        var btn = document.getElementById("reportbtn");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal 
        btn.onclick = function() {
          modal.style.display = "block";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
          modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
          if (event.target == modal) {
            modal.style.display = "none";
          }
        }
});

function activateSortable(){
    $(".action-board").sortable({
       placeholder: "ui-state-highlight",
      
       appendTo: document.body,
       update: function( event, ui ) {},
       start: function( event, ui ) {}
    });
    $(".action-board").disableSelection();
    $( ".action-board" ).on( "sortupdate", function( event, ui ) {
        event.stopPropagation();
        if(sortableTry){
            filterGraphics(event.target.id);
            sortableTry=false;
        }

    } );
    $( ".action-board" ).on( "sortstart", function( event, ui ) {
        if (!sortableTry)
            sortableTry=true;
            
    } );
   
}

function vegaLite(graph,graphId){
    
    var result = graph;

    if(typeof graph.items !== 'undefined'){

        var path = result.items[0]._spec;
        var dataFile = result.items[0]._spec.data.url;
        var fieldX = path.encodings[0].field;
        var fieldY = path.encodings[1].field;
        //var opt = {"actions": false}
        console.log(path.mark)

        console.log(fieldY)
        vlSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
            "data": {"url": dataFile},
            "mark": {"type": path.mark},

            
            "encoding": {
                "x": {
                    "field": fieldX,
                    "type": path.encodings[0].type,
                },
                "y": {
                    "field": fieldY,
                    "type": path.encodings[1].type
                }
            }
        };
    }
    else
    {
        
        var path =  graph.query.spec;
        var dataFile = graph.query.spec.data.url;
        var fieldX = path.encodings[0].field;
        var fieldY = path.encodings[1].field;
        var opt = {"actions": false}
        
        vlSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
            "data": {"url": dataFile},
            "mark": path.mark.enum[0],
            
            "encoding": {
                "x": {
                    "field": fieldX,
                    "type": path.encodings[0].type,
                },
                "y": {
                    "aggregate": "count",
                    "type": "quantitative"
                }
            }
        };
    }
        

       //console.log(graphId) 
        // Embed the visualization in the container with id `vis`
        var handler = new vegaTooltip.Handler();
        vegaEmbed("#"+graphId , vlSpec, { tooltip: handler.call ,mode: "vega-lite"});
}


/*DISPLAY HISTOGRAMME IN THE RESUME TAB*/
function singleGraph() {
    for (var i = 0; i < dimensions.length; i++) {
            //variable
            var result = results[i];
            var data = result.items[0]._spec.data.url;
            var dim = dimensions[i];
            
            var value = dim.name;
            var type = dim.type;
            var opt = {"actions": false}
            var singleSpec;
            if(dim.type === 'quantitative')
                singleSpec = {
                    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                    "data": {"url": data},
                    "width": 60,
                    "height": 50,
                    "config":{
                        
                        "axis": {"labels": 0, "grid": 0, "ticks": 0, "title": 0, "domain":0 },
                        "view": {
                         "stroke": "transparent"
                      }},
                    "mark": {
                        "type": "bar",
                    },
                    "encoding": {
                        "x": {
                            
                            "field": value,
                            "type": type
                        },
                        "y": {
                            "aggregate": "count",
                            "type": "quantitative"
                        }
                    }
                };
            else
                if(dim.type === 'temporal')
                    singleSpec = {
                    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                    "data": {"url": data},
                    "width": 60,
                    "height": 50,
                    "config":{
                        
                        "axis": {"labels": 0, "grid": 0, "ticks": 0, "title": 0, "domain":0 },
                        "view": {
                         "stroke": "transparent"
                      }},
                    "mark": {
                        "type": "bar",
                    },
                    "encoding": {
                        "x": {
                        
                            "timeUnit" : "year", 
                            "field": value,
                            "type": type
                        },
                        "y": {
                            "aggregate": "count",
                            "type": "quantitative"
                        }
                    }
                };
            // Embed the visualization in the container with id `vis`
            if(singleSpec)
                vegaEmbed("#single" + i, singleSpec,opt);
    }
}


function showAttributes(){
    var stade = document.getElementById('display-attributes').getAttribute('data-stade');
    if(stade == 'show'){
        var labels= document.querySelectorAll('#dimensionsBoard a');
        labels.forEach(function (label){
            label.setAttribute("aria-expanded", "false");
            label.classList.add('collapsed');
            
        })
        
        var bodyCards= document.querySelectorAll('#dimensionsBoard div.collapse.show');
        bodyCards.forEach(function (bodyCard){
            bodyCard.classList.remove('show');

        })
        document.getElementById('display-attributes').setAttribute('data-stade','hide');
    }
    else
        if(stade == 'hide'){
            var labels= document.querySelectorAll('#dimensionsBoard a');
            labels.forEach(function (label){
                label.setAttribute("aria-expanded", "true");
                label.classList.remove('collapsed');
                
            })
            
            var bodyCards= document.querySelectorAll('#dimensionsBoard div.collapse');
            bodyCards.forEach(function (bodyCard){
                bodyCard.classList.add('show');

            })
            document.getElementById('display-attributes').setAttribute('data-stade','show');
        }

}

function addTabWorkspace(){
    //get the scope
    var labels = document.getElementById("workspaceLabels");
    var index = indexWorkspace;//document.getElementById("workspaceLabels").getElementsByTagName("LI").length ;
    
    var workspaces= document.getElementById("workspaceContent");


    //clone the tab label
    var cloneLabel= labels.lastChild;
    var clone= cloneLabel.cloneNode(true);

    var cloneWorkspace= workspaces.childNodes[0].cloneNode(true);

    //set the id tab label
    clone.childNodes[0].setAttribute("id", "w"+index+"LabelTab");
    clone.childNodes[0].setAttribute("href", "#w"+index+"Workspace");
    clone.childNodes[0].setAttribute("aria-controls", "w"+index+"Workspace");
    clone.childNodes[0].classList.add("active");
    clone.childNodes[0].textContent="Workspace " + index;
    


    cloneWorkspace.setAttribute("aria-labelledby", "w"+index+"LabelTab");
    cloneWorkspace.setAttribute("id", "w"+index+"Workspace");
    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText = "Variable Exploration"
    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[1].setAttribute("id", "w"+index+"ActionBoard");
    cloneWorkspace.childNodes[0].childNodes[1].childNodes[0].childNodes[1].setAttribute("id", "w"+index+"GraphicsBoard");
    cloneWorkspace.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[1].setAttribute("onclick", "addComments(w"+index+"GraphicsBoard)")

    var actionBoard= document.createElement("div");
    actionBoard.setAttribute("class","card-body action-board")
    actionBoard.setAttribute("id","w"+index+"ActionBoard");
    actionBoard.setAttribute("ondrop","dropDimensionCard(event)");
    actionBoard.setAttribute("ondragover","allowDimensionCardDrop(event)");

    var graphicsBoard=document.createElement("div");
    graphicsBoard.setAttribute("class","card-body row screen-view-graph")
    graphicsBoard.setAttribute("id","w"+index+"GraphicsBoard");

    var commentsContainer =document.createElement("textarea");
    commentsContainer.setAttribute("cols","100");
    commentsContainer.setAttribute("rows","1");
    commentsContainer.setAttribute("id","w"+index+"Comments");
    commentsContainer.setAttribute("class","comments");
    graphicsBoard.append(commentsContainer);

    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].setAttribute('data-idboard', 'w'+index+'ActionBoard' )
    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].setAttribute('data-idgraphs', 'w'+index+'GraphicsBoard' )

    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].setAttribute('data-idboard', 'w'+index+'ActionBoard' )
    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].setAttribute('data-idgraphs', 'w'+index+'GraphicsBoard' )
    //console.log(cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[2].childNodes)
    cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].replaceChild(actionBoard,cloneWorkspace.childNodes[0].childNodes[0].childNodes[0].childNodes[1]);
    cloneWorkspace.childNodes[0].childNodes[1].childNodes[0].replaceChild(graphicsBoard,cloneWorkspace.childNodes[0].childNodes[1].childNodes[0].childNodes[1])
   
    //console.log(cloneActionBoard, cloneWorkspace)
    //desactivar al the tabs
    var activeLabelWorkspace= document.querySelectorAll('#workspaceLabels a.active');
    activeLabelWorkspace.forEach(function(label){
        label.classList.remove('active');
        label.setAttribute("aria-selected", "false");
    })
    var showPanelWorkspace= document.querySelectorAll('#workspaceContent div.tab-pane');
    showPanelWorkspace.forEach(function(panel){
        panel.classList.remove('show');
        panel.classList.remove('active');
    })
    
    cloneWorkspace.setAttribute("class","tab-pane fade show active")
    //add the clones

    document.getElementById("workspaceLabels").insertBefore(clone, null)
    document.getElementById("workspaceContent").insertBefore(cloneWorkspace, null)
    
    indexWorkspace++;
    activateSortable();

}
//interactions events DRAG and DROP
function dragDimensionCard(ev){
    
    ev.dataTransfer.setData('dimensionName',ev.target.getAttribute('data-dimensionname'));
    
}

function dropDimensionCard(ev){

    ev.stopPropagation();


    var dimensionName = ev.dataTransfer.getData("dimensionName");
    var dimensionInfo = getDimensionInfo(dimensionName);
    var targetGroup=false
    if(ev.target.id.includes('GroupCard'))
        targetGroup= true;
    var card = createCardActionBoard(dimensionInfo,ev.target.id,targetGroup);
    

    var actionBoard= document.getElementById(ev.target.id).innerText.split("\n");


    var idBoard;
    
    ev.target.id.includes('GroupCard') ? idBoard= ev.target.parentNode.getAttribute('data-idboard') : idBoard= ev.target.id
  


    
    

    if(targetGroup)
    {
        //console.log(ev.target.id)
        
        var cardGroup = document.getElementById(ev.target.id).innerText.split("\n");
        if(cardGroup[0]=="")
            cardGroup.pop()
        if(!cardGroup.includes(dimensionName)){
            cardGroup.push(dimensionName)
            
            if(cardGroup.length >1)
            {
                //get data type of the variables 
                var dimensionsType = [];
                var countTime = 0
                var countQuantitative = 0
                var countNominal=0

                for(var i =0; i<cardGroup.length;i ++)
                {
                    
                    switch(getDimensionInfo(cardGroup[i]).type){
                        case 'quantitative':
                            countQuantitative++
                            break;
                        case 'nominal':
                            countNominal++
                            break;
                        case 'temporal':
                            countTime++
                            break;

                    }
                }

               

                if(cardGroup.length ==2)
                {
                    if(countNominal==2)
                    {
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[2].classList.add('text-gray-500')
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[1].classList.add('text-gray-500')
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[0].classList.add('text-gray-500')

                    }
                    if(countQuantitative==2 )
                    {
                       document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[0].classList.add('text-gray-500')

                    }
                    if(countQuantitative== 1 || countTime==1 || countNominal ==1 )
                    {
                        if(countTime==1)
                            document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[2].classList.add('text-gray-500')
                        if(countNominal==1)
                            document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[1].classList.add('text-gray-500')
                    }

                }
                if(cardGroup.length ==3)
                {
                    if( ( countQuantitative == 2 && (countTime==1 || countNominal==1) ) || (countQuantitative == 1 && countTime==1 && countNominal==1)  )
                    {
                        
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[2].classList.add('text-gray-500')
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[1].classList.add('text-gray-500')
                        document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[0].classList.add('text-gray-500')

                    } 

                }
                if(cardGroup.length>3)
                    return;
            }
            else
            {
                var dataType = dimensionInfo.type;
                if(dataType=='temporal')
                   document.getElementById(ev.target.id).parentNode.childNodes[0].childNodes[0].childNodes[2].classList.add('text-gray-500')
            }

            document.getElementById(ev.target.id).append(card);
            //filterGraphics(idBoard);
        }
        else{

            return;
        }

        
        


    }

    if(!actionBoard.includes(dimensionName))
    {
        document.getElementById(ev.target.id).append(card);
        filterGraphics(idBoard);
        return;
    }
    

    
 


}

function allowDimensionCardDrop(ev) {
  ev.preventDefault();
}

function getDimensionInfo(dimensionName){
    for(var dimension of dimensions)
    {
        if(dimension.name == dimensionName)
            return dimension;
    }
}

function createCardActionBoard(dimensionInfo, idBoard,targetGroup)
{
    var card = document.createElement("div");
    card.setAttribute("class","card h-100 py-1 mb-3");
    card.setAttribute("data-dimensionname", dimensionInfo.name);
    card.setAttribute("data-idboard", idBoard);
    

    var cardBody= document.createElement("div");
    cardBody.setAttribute("class","card-body row no-gutters align-items-center");

    var cardData = document.createElement("div");
    cardData.setAttribute("class","col mr-1 row");
    var iconTypeData= document.createElement("I");
    iconTypeData.setAttribute("class","fas fa-1x mr-1")
    
    
    var dimensionName = document.createElement("H6");
    dimensionName.setAttribute("class","m-0 text-gray-800 font-weight-bold");
    dimensionName.append(document.createTextNode(dimensionInfo.name));

    cardData.append(iconTypeData);
    cardData.append(dimensionName);

    var cardActions= document.createElement("a");
    cardActions.setAttribute("class","col-auto");
    cardActions.setAttribute("role","button");
    cardActions.setAttribute("onclick","removeCardDimensionBoard(this)");
    

    var iconDelete= document.createElement("I");
    iconDelete.setAttribute("class","fas fa-trash-alt fa-1x text-gray-300")
    cardActions.append(iconDelete);

    switch(dimensionInfo.type){
        case 'quantitative':
            card.classList.add('border-left-info');
            iconTypeData.classList.add('fa-chart-line');
            iconTypeData.classList.add('text-info');
            break;
        case 'nominal':
            card.classList.add('border-left-primary');
            iconTypeData.classList.add('fa-language');
            iconTypeData.classList.add('text-primary');
            break;
        case 'ordinal':
            card.classList.add('border-left-success');
            iconTypeData.classList.add('fa-boxes');
            iconTypeData.classList.add('text-success');
            break;
        case 'temporal':
            card.classList.add('border-left-warning');
            iconTypeData.classList.add('fa-stopwatch');
            iconTypeData.classList.add('text-warning');
            break;
        default:
            card.classList.add('border-left-primary');
            iconTypeData.classList.add('fa-language');
            iconTypeData.classList.add('text-primary');
    }

    cardBody.append(cardData);
    if(!targetGroup)
        cardBody.append(cardActions);
    card.append(cardBody);

    return card;
}
function filterGraphics(idBoard){


    
    var actionBoard = document.getElementById(idBoard).childNodes;
    //console.log(actionBoard);
    //var cardList = actionBoard.childNodes;
    
   
    var selectGraphics = []
    var idWorkspace = 'w' + parseInt(idBoard.replace(/[A-Za-z$-]/g, ""),10)  + 'GraphicsBoard' ;
    
    
    actionBoard.forEach(function(card){
        
        if( card.getAttribute("class").includes("group-card"))
        {
            
            
            var cardGroup= document.getElementById(card.childNodes[1].getAttribute('id')).innerText.split("\n");
            if(cardGroup.length >1)
            {
                if(cardGroup.length==2)
                {
                    results.forEach(function(result){
                    var axes= result.items[0]._spec;

                        if((cardGroup[0]==axes.encodings[0].field && cardGroup[1]==axes.encodings[1].field )|| (cardGroup[0]==axes.encodings[1].field && cardGroup[1]==axes.encodings[0].field ) ){
                        selectGraphics.push(result);
                    }
                    })
                }
                if(cardGroup.length==3){

                }
            }
            else
            {
                console.log("1 group-card")
                
               
                resultsOneDimension.forEach(function(result){
                    //console.log(result.query.spec.encodings[0].field)
                    //console.log(cardGroup[0])
                    if(cardGroup[0] == result.query.spec.encodings[0].field )
                    {
                        selectGraphics.push(result)
                    }

                })


                /*$.ajax({
                    url: '/graph/single',
                    method: 'POST',
                    data: dimensionInfo
                    }).done(function(res) {
                        
                        selectGraphics.push(res)
                        console.log(selectGraphics)
                        selectGraphics.forEach(function(graph,index){
                            console.log(graph)
                            var graphId="w" + parseInt(idBoard.replace(/[A-Za-z$-]/g, ""),10)+"graphVega" + index + card.getAttribute('data-idboard');
                            document.getElementById(idWorkspace).append(createCardGraphDisplay(graph,idBoard,graphId));
                           
                            vegaLite(graph,graphId);

                        })
                        
                })
                */
                //var car = {name:"group", variables:"1", dimensionInfo: getDimensionInfo(cardGroup[0]) };
                //selectGraphics.push( car);
                //console.log(selectGraphics)
                    //createBasicCountGraphic(, result.items[0]._spec.data.url,  ));
                
            }

            
        }
        else{
            var dimensionName= card.getAttribute('data-dimensionname');
            //console.log(dimensionName);
            results.forEach(function(result){
            var axes= result.items[0]._spec;

            if(dimensionName==axes.encodings[0].field){
                selectGraphics.push(result);
            }
            else{
                if(dimensionName==axes.encodings[1].field){
                    selectGraphics.push(result);
                }
            }

        })
        }
        

    })
    

    
    //console.log(idWorkspace)
    //clean the workspace
    
    var comments = document.getElementById(idWorkspace).childNodes[0].cloneNode();
    document.getElementById(idWorkspace).parentNode.replaceChild(document.getElementById(idWorkspace).cloneNode(),document.getElementById(idWorkspace) )
    document.getElementById(idWorkspace).append(comments)

    selectGraphics = selectGraphics.filter(function(graph,index){
        return selectGraphics.indexOf(graph) >=index;
    });

    
    selectGraphics.forEach(function(graph,index){
       // console.log(graph)
        var graphId="w" + parseInt(idBoard.replace(/[A-Za-z$-]/g, ""),10)+"graphVega" + index;
        document.getElementById(idWorkspace).append(createCardGraphDisplay(graph,idBoard,graphId));
       
        vegaLite(graph,graphId);

    })
    
    /*var graphs= results.items;
    results.forEach(function (result){
        graphs.forEach(function(graph){
            console.log()
        })
    })
    */
    
}

function createCardGraphDisplay(graph,idBoard,graphId){
    var cardGraphDisplay= document.createElement("div");
    cardGraphDisplay.setAttribute("class","col-md-auto");

    var cardGraph= document.createElement("div");
    cardGraph.setAttribute("class","card mr-2 mb-4 border-left-secondary");

    var cardHeader= document.createElement("a");
    cardHeader.setAttribute("class","d-block card-header py-2");
    cardHeader.setAttribute("draggable", "true");

    var cardHeaderContainer= document.createElement("div");
    cardHeaderContainer.setAttribute("class", "row no-gutters align-items-center");

    var cardHeaderInformation=document.createElement("div");
    cardHeaderInformation.setAttribute("class","col mr-1 row");

    var cardHeaderChartType= document.createElement("H6");
    cardHeaderChartType.setAttribute("class","m-0 font-weight-bold text-secondary");
    cardHeaderChartType.append(document.createTextNode('chart: '));

    var cardHeaderAxesNames= document.createElement("H6");
    cardHeaderAxesNames.setAttribute("class","m-0 font-weight-bold text-primary");
    var dimensionText;
    
    if(typeof graph.items !== 'undefined')
    {
        dimensionText= graph.items[0]._spec.encodings[0].field  + ', ' + graph.items[0]._spec.encodings[1].field
    }
    else
        dimensionText= graph.query.spec.encodings[0].field + ', ' + graph.query.spec.encodings[1].field
    cardHeaderAxesNames.append(document.createTextNode(dimensionText));

    var cardHeaderActions=document.createElement("div");
    cardHeaderActions.setAttribute("class","col-auto");

    var actionBookmark=document.createElement("a");
    actionBookmark.setAttribute("class","col-auto");
    actionBookmark.setAttribute("role", "button");
    actionBookmark.setAttribute("onclick", "addBookmark("+graphId+")");

    var iconThumbtack=document.createElement("i");
    iconThumbtack.setAttribute("class", "fas fa-thumbtack fa-1x text-gray-500")

    var cardBody=document.createElement("div");
    cardBody.setAttribute("class","card-body");

    var graphVega=document.createElement("div");
    graphVega.setAttribute("class","resize-graph");
    graphVega.setAttribute("id",graphId);

    actionBookmark.append(iconThumbtack);

    cardBody.append(graphVega);
    cardHeaderInformation.append(cardHeaderChartType);
    cardHeaderInformation.append(cardHeaderAxesNames);

    cardHeaderContainer.append(cardHeaderInformation);
    cardHeaderContainer.append(actionBookmark)
    cardHeader.append(cardHeaderContainer);
    cardGraph.append(cardHeader);
    cardGraph.append(cardBody);
    cardGraphDisplay.append(cardGraph);

    
    return cardGraph;
}
function deleteWorkspace(label){
    //if you have only one workspace
    var index= indexWorkspace;
    if(index == 1)
        return alert("We can not delete this workspace");
    //delete the tab panel

    document.getElementById(label.parentNode.childNodes[0].getAttribute("aria-controls")).remove();
    
    //delete the label,
    label.parentNode.parentNode.removeChild(label.parentNode);
    
    //activate the first workspace
    
     

}

function cleanBoard(board){
    var idBoard= $(board).attr('data-idboard');
    var idGraphs= $(board).attr('data-idgraphs');
    var comments= document.getElementById(idGraphs).childNodes[0].cloneNode()
    
    document.getElementById(idBoard).parentNode.replaceChild(document.getElementById(idBoard).cloneNode(),document.getElementById(idBoard) );
    document.getElementById(idGraphs).parentNode.replaceChild(document.getElementById(idGraphs).cloneNode(),document.getElementById(idGraphs) );
    document.getElementById(idGraphs).append(comments)
}

function removeCardDimensionBoard(card){
    var board=card.parentNode.parentNode.parentNode;

    var fullCard= card.parentNode.parentNode;
    board.removeChild(fullCard);
    filterGraphics(fullCard.getAttribute('data-idboard'));
    activateSortable();

}

function createGroupCard(boardHeader){
    var idBoard= $(boardHeader).attr('data-idboard');
    var indexChild= document.getElementById(idBoard).childNodes.length +1;

    document.getElementById(idBoard).parentNode.childNodes[0].childNodes[0].childNodes[0].innerText = "Create Graph"

    var groupCard= document.createElement("div");
    groupCard.setAttribute("class","card mb-1 group-card");
    groupCard.setAttribute("data-idboard", idBoard);

    var headerCard= document.createElement("div");
    headerCard.setAttribute("class","card-header row no-gutters align-items-center");

    var iconsDataType=document.createElement("div");
    iconsDataType.setAttribute("class","col mr-1");

    var iconNominal= document.createElement("I"); 
    iconNominal.setAttribute("class", "fas fa-language fa-1x text-primary mr-1");

    var iconQuantitative= document.createElement("I"); 
    iconQuantitative.setAttribute("class", "fas fa-chart-line fa-1x text-info mr-1")

    //var iconOrdinal= document.createElement("I"); 
    //iconOrdinal.setAttribute("class", "fas fa-boxes fa-1x text-success mr-1")

    var iconTemporal= document.createElement("I"); 
    iconTemporal.setAttribute("class", "fas fa-stopwatch fa-1x text-warning mr-1")

    var iconsActions= document.createElement("a");
    iconsActions.setAttribute("class","col-auto");
    iconsActions.setAttribute("role","button");
    iconsActions.setAttribute("onclick","removeCardDimensionBoard(this)");

    var iconDelete= document.createElement("I"); 
    iconDelete.setAttribute("class","fas fa-trash-alt fa-1x text-gray-300")

    var bodyCard=document.createElement("div");
    bodyCard.setAttribute("class","card-body");
    bodyCard.setAttribute("ondrop","dropDimensionCard(event)");
    bodyCard.setAttribute("ondragover","allowDimensionCardDrop(event)");
    bodyCard.setAttribute("id",idBoard+"GroupCard" +indexChild);

    iconsDataType.append(iconQuantitative);
    iconsDataType.append(iconNominal);
    iconsDataType.append(iconTemporal);
    //iconsDataType.append(iconOrdinal);
    iconsActions.append(iconDelete);
    headerCard.append(iconsDataType);
    headerCard.append(iconsActions);
    groupCard.append(headerCard);
    groupCard.append(bodyCard);

    document.getElementById(idBoard).append(groupCard);

}

function createBasicCountGraphic(dimensionInfo,data,graphId){
        
            
        var opt = {"actions": false}
        vlSpec = {
                    "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                    "data": {"url": data},
                    "mark": {
                        "type": "?",
                        "tooltip": {"content": "data"}
                    },
                    "encoding": {
                        "x": {
                            "bin": true,
                            "field": dimensionInfo.name,
                            "type": dimensionInfo.type
                        },
                        "y": {
                            "aggregate": "count",
                            "type": "quantitative"
                        }
                    }
                };

        
        // Embed the visualization in the container with id `vis`
        vegaEmbed("#"+graphId , vlSpec,opt);
}

function addBookmark(graphId)
{
    /*bookMarks.push(graphId);
    var cloneGraph= graphId.cloneNode(true)
    cloneGraph.setAttribute("id", "report" + bookMarks.length)
    console.log(cloneGraph)
     var cloneGraph= document.getElementById(graphId.getAttribute('id')).cloneNode(true);
    cloneGraph.setAttribute("id", "report" + bookMarks.length)
    console.log(cloneGraph)
    */

    
   /* var cloneGraph = graphId.parentNode.parentNode.cloneNode(true);
    vegaLite(results[0],graphId.getAttribute('id'));
    var dimensions= (graphId.parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].childNodes[1].innerText).split(',')
    var xDimension = dimensions[0].trim();
    var yDimension = dimensions[1].trim();
    var graphBookmark;
    
    console.log(dimensions)
    ;
    console.log(cloneGraph);

    */
    document.getElementById('bookmarkContainer').append(graphId.parentNode.parentNode)

}

function addComments(idBoard){
    
    var idComments= idBoard.getAttribute('id').replace('GraphicsBoard','Comments');
    console.log(idComments);
    document.getElementById(idComments).style.display= "block"
}
