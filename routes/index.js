const express = require('express');
var multer = require('multer');
var fs = require('fs');
var cql = require('compassql');
var csvToJson = require('convert-csv-to-json');
var tooltip = require('vega-tooltip');
var path = require('path');
const rimraf = require('rimraf');
const router = express.Router();


//delete file inside uploads after one day
const directory = 'uploads';
fs.readdir(directory, function(err, files) {
    if (err) {
                return console.error(err);
            }
    files.forEach(function(file, index) {
        fs.stat(path.join(directory, file), function(err, stat) {
            
            var endTime, now;
            if (err) {
                return console.error(err);
            }
            now = new Date().getTime();
            endTime = new Date(stat.ctime).getTime() + 86400000;
            if (now > endTime) {
                return rimraf(path.join(directory, file), function(err) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log('successfully deleted');
                });
            }
        });
    });
});

/*store the import file in the uploads directory*/
var name;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        name =  "temp" + Date.now() + ".csv";
        cb(null, name);
    }
});
var upload = multer({storage: storage});



/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('home');
});

/* GET Load Data. */
router.get('/load', (req, res, next ) => {
  res.render('load');
});

/* POST file importation. */
router.post('/load', upload.single('file'),function (req, res, next){

    //store the name of the file imported

        var uploadedFile = name;
        req.session.filename = uploadedFile;
    //for the button "next"
    	res.redirect('/analyzer');
});
//build graphics schema vega)
router.post('/graph/single/',  function(req, res){
        
    
    var json = convertCsvToJson(req.session.filename);

    var schema = cql.schema.build(json);

    var resultsGraphics = createSingleGraph(req.body ,schema, req.session.filename);

        res.send(resultsGraphics);
    
    
});


/* GET Analyzer. */
router.get('/analyzer', async function(req, res, next ){
  
  //Build a data schema.
    var json = convertCsvToJson(req.session.filename);

    var schema = cql.schema.build(json);


    var dimensions = await getAllDimension(req.session.filename, json);

    var resultsGraphics = await createVegaGraph(dimensions,schema, req.session.filename);

    var oneDimensionGraphics =await createOneDimensionGraphics(dimensions,schema,req.session.filename)

    //console.log(resultsGraphics[0], oneDimensionGraphics[0])


    var indexWorkspace = 1;

    res.render('analyzer', {keyDimensions:dimensions, keyGraphs: resultsGraphics, keyIndexWorkspace: indexWorkspace, keyGraphsOneDimension: oneDimensionGraphics});
    
    //res.render('try');
    //res.render('form');

});


// functions


async function getAllDimension(filename,json) {

    var file = fs.readFileSync("./uploads/" + filename, 'utf8');
    //split into a tab
    file = file.split('\n');
    //take only the header dimensions
    var arrayDimensions = file[0].split(',');

    var dimensions=[];
    var lengthDimensions= arrayDimensions.length
    

    
    
    //replace empty val by 0
    /*for(var f= 0;f<fileLength;f++) {
            file[f] = file[f].replace(',,', ',0,');
    }
    */
  
    //getting the dimension attributes for the card variable

    for(var i=0 ; i< lengthDimensions; i++){
        
        
        dimensions.push(getDimension(arrayDimensions[i],json))
     

    }
    
    
    return dimensions;
}

function getDimension(nameDimension,json)
{
        
        var nameDimensionJson= nameDimension.replace(/ /g,"");
        var dimension = {
                name : '',
                type:  '',
                tag: '',
                min:   null,
                max: null, 
                mean: null,
                mode: null


            };
        var typeDimension;
        var sum = 0.0;
        var col =[];
        var jsonLenght = json.length;
       for(var jsonRow of json)
        {
            if(typeof jsonRow[nameDimensionJson]==='string')
            {
                if(isValidDate(jsonRow[nameDimensionJson]))
                    typeDimension='temporal'
                else
                    typeDimension= 'nominal'

                break;
            }
            else{
                typeDimension = 'quantitative'
            }
           

            sum += parseFloat(jsonRow[nameDimensionJson]);
           
            col.push(parseFloat(jsonRow[nameDimensionJson]));


        }

        dimension.name =  nameDimension;       
        dimension.type= typeDimension;
        dimension.tag= nameDimensionJson;
        dimension.min = (typeDimension === 'nominal')? null : Math.min.apply(null,col);
        dimension.max = (typeDimension === 'nominal')? null : Math.max.apply(null,col);
        dimension.mean= (typeDimension === 'nominal')? null : parseFloat((sum/jsonLenght).toFixed(2));
       
        
        
        
        return dimension
}
function isValidDate(date) {
    var dateWrapper = new Date(date);
    return !isNaN(dateWrapper.getDate());
}

function convertCsvToJson(filename) {
    let fileInputName = "./uploads/" + filename;
    let content = fs.readFileSync(fileInputName, 'utf8');
    //end of line
    content=content.replace("\r\n", "\n").replace("\r", "\n");
    fs.writeFileSync(fileInputName,content);

    //find the delimiter

    //print number as number and not in string
    csvToJson.formatValueByType().getJsonFromCsv(fileInputName);

    //as default delimiter is ; so we set as ,
    var test=  csvToJson.fieldDelimiter(',').getJsonFromCsv(fileInputName);

    let json = csvToJson.getJsonFromCsv("./uploads/" + filename);

    return json;
}

function checkDataType(index, filename) {
	var file = fs.readFileSync("./uploads/" + filename, 'utf8');
    //split into a tab
    file = file.split('\n');

    var linesToReview = 5; 
    var lines = [];
    var typeIndexControler;
    var typeIndex;
    for(var i=1; i<=linesToReview;i++)
    {
    	lines[i] = file[i].split(',');
        typeIndex = (isNaN(lines[i][index])) ? 'ordinal' : 'quantitative'
        typeIndexControler  = (i === 1 ) ? typeIndex : (typeIndex === typeIndexControler) ? typeIndex : ['ordinal','quantitative'];
    }

    return typeIndexControler;
}

async function createVegaGraph(dimensions,schema,filename){
    var resultsGraphics = [];
    var dimensionsLength = dimensions.length;
    
    for(var j=0; j<dimensionsLength;j++){
        var dimension = dimensions[j];
        
        for(var i= j+1; i<dimensionsLength;i++ )
        {
            
            var graphVega= {
                        "spec": {
                            "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
                            "data": {
                                "url": "uploads/" + filename,
                                "format": {type: "csv"}
                                },
                            "mark": "?",
                            "encodings": [
                                {
                                    "channel": "?",
                                    "field": dimension.name,
                                    "type": dimension.type
                                },{
                                    "channel": "?",
                                    "field":dimensions[i].name,
                                    "type": dimensions[i].type
                                }
                            ]
                        },
                        "chooseBy": "effectiveness"
                        };

            var output = cql.recommend(graphVega, schema);
            resultsGraphics.push(output.result);
        }


    }

    return resultsGraphics; 
}

function createSingleGraph(dimension,schema,filename)
{
    
    var vegaGraph = {
          "spec": {
            "$schema": "hhttps://vega.github.io/schema/vega-lite/v2.json",
             "data": {
                                "url": "uploads/" + filename,
                                "format": {type: "csv"}
                                },
            "mark": "?"
          },
          "nest": [
            {
              "groupBy": ["field", "aggregate", "bin", "timeUnit", "stack"],
              "orderGroupBy": "aggregationQuality"
            },
            {
              "groupBy": [{
                "property": "channel",
                "replace": {
                  "x": "xy", "y": "xy",
                  "color": "style", "size": "style", "shape": "style", "opacity": "style",
                  "row": "facet", "column": "facet"
                }
              }],
              "orderGroupBy": "effectiveness"
            },
            {
              "groupBy": ["channel"],
              "orderGroupBy": "effectiveness"
            }
          ],
          "orderBy": "effectiveness",
          "config": {
            "autoAddCount": true
          }
        }

    switch(dimension.type){
        case 'quantitative':
            vegaGraph.spec.encodings= [
                  {
                    "channel": "?",
                    "bin": "?",
                    "aggregate": "?",
                    "field": dimension.name,
                    "type": "quantitative"
                  }
                ]
            break;
        case 'temporal':
            vegaGraph.spec.encodings= [
                  {
                    "channel": "?",
                    "timeUnit": "?",
                    "field": dimension.name,
                    "type": "temporal"
                  }
                ]
            break;
        case 'nominal':
            vegaGraph.spec.encodings= [
                  {
                    "channel": "?",
                    "field": dimension.name,
                    "type": "nominal"
                  }
                ]
            break;
    }
    
        return cql.recommend(vegaGraph, schema);
}

async function createOneDimensionGraphics(dimensions,schema,filename){
    var resultsGraphics = [];
    var dimensionsLength = dimensions.length;
    for(var i=0; i<dimensionsLength;i++){
        var dimension = dimensions[i];
        resultsGraphics.push(createSingleGraph(dimension,schema,filename))
    }
    return resultsGraphics;
}
module.exports = router;