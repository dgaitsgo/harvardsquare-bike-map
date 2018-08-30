var fs = require('fs')
var _  = require('lodash')
var turf = require('turf')

var letters = ['A', 'B', 'C', 'D', 'E']
var nums = ['1', '2', '3', '4']

function getIndices(i) {

    var res = [
        'A1',
        'B1',
        'C1',
        'D1',
        'E1',
        'A2',
        'B2',
        'C2',
        'D2',
        'E2',
        'A3',
        'B3',
        'C3',
        'D3',
        'E3',
        'A4',
        'B4',
        'C4',
        'D4',
        'E4'
    ]

    return (res[i])
}

var grid = JSON.parse(fs.readFileSync('./harvard_square_grid.geojson', 'utf8'))
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

grid['features'].forEach( (cell, gridIdx) => {

    serviceArea['features'].forEach(road => {

        if (turf.intersect(cell, road) != undefined) {

            var name = road['properties']['tags']['name']
            var indices = getIndices(gridIdx)

            if (saHash[name].indexOf(indices) === -1) {
                saHash[name].push(indices)
            }
        }
    })

    fs.writeFileSync('./map_index.json', JSON.stringify(saHash))
})
