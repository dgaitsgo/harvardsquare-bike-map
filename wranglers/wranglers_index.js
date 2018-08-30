var fs = require('fs')
var _  = require('lodash')
var axios = require('axios');
var osmtogeojson = require('osmtogeojson')
var query_overpass = require('query-overpass')
var querystring = require('querystring')
var JSONStream = require('JSONStream')

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

var letters = ['A', 'B', 'C', 'D', 'E']

function getIndices(i) {

    var x = i % 4
    var y = i / 5

    return (`${letters[y]}${x + 1}`)
}

var bboxes = JSON.parse(fs.readFileSync('./harvard_square_tile_bboxes.json', 'utf8'))
var serviceArea = JSON.parse(fs.readFileSync('./harvard_square_repair.geojson', 'utf8'))
var saHash = hashNames(serviceArea['features'])

function hashNames(features) {

    var hash = {}

    features.forEach(feature => {
        var name = feature['properties']['tags']['name']
        hash[name] = []
    })

    return (hash)
}

function filterRoads(elements) {

    var roads = elements.filter(element => {
        var tags = element.tags

        if (!tags)
            return (false)

        var cond =
        tags.name &&
        tags.highway &&
        !tags.amenity &&
        tags.building != "yes"

        return (cond)
    })

    return (roads)
}


bboxes.forEach((bbox, bboxIdx) => {

    // if (bboxIdx != 0)
        // return ;

    //  South, West, North, East
    console.log(bbox)
    var query = `[out:json];way(${bbox.bottom},${bbox.left},${bbox.top},${bbox.right});out%20geom;`

    var reqOptions = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    }

    axios.get(`http://overpass-api.de/api/interpreter?data=${query}`)
        .then(res => {

            console.log(res.data)

            var roads = filterRoads(res.data['elements'])
            roads.forEach(road => {

                var name = road['tags']['name']

                if (saHash[name]) {
                    var indices = getIndices(bboxIdx)
                    if (saHash[name].indexOf(indices) === -1)
                        saHash[name].push(indices)
                }

            })

            fs.writeFileSync('./map_index.json', JSON.stringify(saHash))
        })
        .catch(err => {
            console.log(err)
        })

})

/*

var index = {
    "streetName" : ['LetterNumber']
}

    For each bbox,
        formulate overpass call
        filter streets
        make sure they exist in service area



*/
