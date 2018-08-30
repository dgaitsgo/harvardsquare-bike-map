var fs = require('fs')
var _  = require('lodash')
var axios = require('axios')
var osmtogeojson = require('osmtogeojson')

var left = JSON.parse(fs.readFileSync('./ways_leftBbox_geom.json', 'utf8'))
var mid = JSON.parse(fs.readFileSync('./ways_midBbox_geom.json', 'utf8'))
var right = JSON.parse(fs.readFileSync('./ways_rightBbox_geom.json', 'utf8'))
var repair = JSON.parse(fs.readFileSync('./ways_repair_geom.json', 'utf8'))

var bboxes = [left, mid, right, repair]
var uniqueRoads = {}

//The original query contained every single way, but we only roads.
//Here's a rudiementary way of filtering out buildings, coastlines, etc.
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

repair['elements'] = filterRoads(repair['elements'])


//There is a lot of redundant information between the three bboxes
//Here, we hash each name and save all of the unique tag information in "entries"
function hashNames(elements) {

    elements.forEach(element => {

        var name = element.tags.name

        if (!uniqueRoads[name]) {
            uniqueRoads[name] = []
        }

        uniqueRoads[name].push(element)
    })
}

//Finally, lets see how many unique tags there are and if there are any conflicts
//between the entries for each road
function getUniqueDatas(uniqueRoads) {

    var names = Object.keys(uniqueRoads)

    //if they have the same id, just keep one
    names.forEach(name => {
        uniqueRoads[name] = _.uniqBy(uniqueRoads[name], element => element.id)
    })

    // console.log(uniqueRoads)
}

function toGeoJson(uniqueRoads) {

    var flatRoads = {}

    flatRoads.elements = []

    Object.keys(uniqueRoads).forEach( (name, i) => {

        uniqueRoads[name].forEach(element => {
            flatRoads.elements.push(element)
        })
    })

    return (osmtogeojson(flatRoads))

}

function processForMapbox(bboxes) {

    bboxes.forEach(box => {
        box.elements = filterRoads(box.elements)
        hashNames(box.elements)
    })

    getUniqueDatas(uniqueRoads)

    var geojson = toGeoJson(uniqueRoads)

    fs.writeFileSync('./harvard_square_repair.geojson', JSON.stringify(geojson))
}


processForMapbox(bboxes)

//// DEBUG:
//see total entries
function totalEntries(uniqueRoads) {

    let tally = Object.keys(uniqueRoads)
        .map(key => uniqueRoads[key].length)
        .reduce( (acc, cv) => acc + cv)

    console.log('totalEntries : ', tally)
}

// function nodeToLongLat(node) {
//
//     var url = `http://api.openstreetmap.org/api/0.6/node/${node}`
//     axios.get(url)
//         .then(res => {
//             console.log(res)
//         })
//         .catch(error => {
//             console.log(error)
//         })
// }


// nodeToLongLat(379598392)
// var xmlStr = '<?xml version="1.0" encoding="UTF-8"?>\n<osm version="0.6" generator="CGImap 0.6.1 (3863 thorn-02.openstreetmap.org)" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">\n <node id="379598392" visible="true" version="4" changeset="20646514" timestamp="2014-02-18T22:28:29Z" user="wambag" uid="326503" lat="42.3677752" lon="-71.1159253"/>\n</osm>\n'
// parseXML(xmlStr)
