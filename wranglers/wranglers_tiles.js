var t = require('tiles-in-bbox')
var fs = require('fs')
var _ = require('lodash')

var zoom = 15
var bbox = {
    left : -71.1279,
    bottom : 42.356,
    right : -71.1002,
    top : 42.3876
}
//
// function tile2bbox(x, y, zoom) {
//
//   var bb = {}
//
//   bb.top = tile2lat(y, zoom)
//   bb.bottom = tile2lat(y + 1, zoom)
//   bb.left = tile2lon(x, zoom)
//   bb.right = tile2lon(x + 1, zoom)
//   return bb;
// }
//
//
function bboxTiles(tiles) {

    return (
        tiles.map(tile => {
            return (t.bboxTile(tile))
        })
    )
}

var tiles = t.tilesInBbox(bbox, zoom)
var bboxes = bboxTiles(tiles)

//Build grid
var grid = {
    type : "FeatureCollection",
    features : []
}

grid.features = bboxes.map(bbox =>
    ({
        type : "Feature",
        properties : {},
        geometry : {
            type : "Polygon",
            coordinates : [
                [
                    [bbox.right, bbox.bottom],
                    [bbox.left, bbox.bottom],
                    [bbox.left, bbox.top],
                    [bbox.right, bbox.top],
                    [bbox.right, bbox.bottom],
                ]
            ]
        }
    })
)

var topIndex = {
    type : "FeatureCollection",
    features : []
}

var leftIndex = {
    type : "FeatureCollection",
    features : []
}

function makeIndexFromTiles(tiles) {

    //find edges
    var uniqX = _.uniq(tiles.map(tile => tile.x)).sort()
    var uniqY = _.uniq(tiles.map(tile => tile.y)).sort()

    var topEdge = uniqX.map(x => ({
        x,
        y : uniqY[0],
        z : tiles[0].z
    }))

    var leftEdge = uniqY.map(y => ({
        x : uniqX[0],
        y,
        z : tiles[0].z
    }))

    var bboxesTopEdge = bboxTiles(topEdge)
    var bboxesLeftEdge = bboxTiles(leftEdge)

    var topOffset = Math.abs(bboxesTopEdge[0].right - bboxesTopEdge[0].left) / 8
    var leftOffset = Math.abs(bboxesTopEdge[0].right - bboxesTopEdge[0].left) / 6

    topIndex.features = bboxesTopEdge.map((bbox, i) =>
        ({
            type : "Feature",
            properties : {
                i,
            },
            geometry : {
                type : "Polygon",
                coordinates : [
                    [
                        [bbox.right, bbox.top],
                        [bbox.left, bbox.top],
                        [bbox.left, bbox.top + topOffset],
                        [bbox.right, bbox.top + topOffset],
                        [bbox.right, bbox.top],
                    ]
                ]
            }
        })
    )

    leftIndex.features = bboxesLeftEdge.map((bbox, i) =>
        ({
            type : "Feature",
            properties : {
                i : String.fromCharCode(65 + i)
            },
            geometry : {
                type : "Polygon",
                coordinates : [
                    [
                        [bbox.left, bbox.bottom],
                        [bbox.left - leftOffset, bbox.bottom],
                        [bbox.left - leftOffset, bbox.top],
                        [bbox.left, bbox.top],
                        [bbox.left, bbox.bottom],
                    ]
                ]
            }
        })
    )



    // fs.writeFileSync('./index_top.geojson', JSON.stringify(topIndex))
    fs.writeFileSync('./index_left.geojson', JSON.stringify(leftIndex))

}

makeIndexFromTiles(tiles)

// fs.writeFileSync('./harvard_square_grid.geojson', JSON.stringify(grid))
// fs.writeFileSync('./harvard_square_index.geojson', JSON.stringify(index))

// fs.writeFileSync('./harvard_square_tiles.json', JSON.stringify(tiles))
// fs.writeFileSync('./harvard_square_tile_bboxes.json', JSON.stringify(bboxes))
// console.log(bboxes)
// var bboxes = bboxTiles(tiles)


// const base = `https://api.mapbox.com`
// const style = 'styles/v1/isaaclumpkins/cjkzkmw5v0u9b2rqk5auvd31e'
// const api = 'tiles'
// const accessToken = 'pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw'
// const version = 'v1'
// const tile = '15/9911/12117'
// const imgSize = 256


// 'https://api.mapbox.com/styles/v1/isaaclumpkins/cjkzkmw5v0u9b2rqk5auvd31e/tiles/256/15/9911/12117?access_token=pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw'
// var url = `${baseUrl}/${style}/${api}/${imgSize}/${tile}.png?access_token=${accessToken}`
// https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/${z}/${x}/${y}?access_token=<your access token here
// https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/${z}/${x}/${y}?access_token=<your access token here
// https://api.mapbox.com/v4/isaaclumpkins.cjkzkmw5v0u9b2rqk5auvd31e/15/9911/12117.png?style=mapbox://styles/mapbox/streets-v10@00&access_token=pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw'
// https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/12/1171/1566.mvt?style=mapbox://styles/mapbox/streets-v10@00&access_token=pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw'
// console.log(console.log(url))

// https://api.mapbox.com/v4/mapbox.mapbox-streets-v7/15/9911/12117.png?style=mapbox://styles/isaaclumpkins/cjkzkmw5v0u9b2rqk5auvd31e&access_token=pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw
// curl "https://api.mapbox.com/styles/v1/isaaclumpkins/cjkzkmw5v0u9b2rqk5auvd31e/wmts?access_token=pk.eyJ1IjoiaXNhYWNsdW1wa2lucyIsImEiOiJjajNhdTVlZXMwMGFnMzJvNzdoemQ0N3phIn0.hv3Atoq7kaBU9F-YCBGBOw"
