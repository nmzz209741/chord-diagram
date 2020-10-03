/**
 * Shreeti Shrestha 
 * 
 * Inputs :
 * Sourcename
 * Destname
 * Valuename
 * data
 * 
 * 
 * Todo
 * 1. Set container
 * Set margin
 * Set Width, Height
 * Append svg
 * append wrapper
 * 
 * 2. Set pre requisites
 * Set inner and outer radius for chord arc
 * Get Arc sections 
 * Get fixed color spectrum
 * 
 * 3. Form the matrix
 * write chord mapper function - Return matrix, matrix map
 * Get data
 * form Matrix
 * 
 * 4. Chord Reader function
 * write a chord reader function
 * 
 * 4. form chord
 * chord generator - shape data with d3.chord
 * get chord - using chordgenerator
 * define arcs
 * define ribbon
 * define opacities = default 
 * define colors 
 * 
 * 5 fill ribbon
 * gradient:??
 * 
 * 
 * 6. add labels
 * 
 * 7. add tooltips
 * 
 * 8. hover over 
 * 
 * 
 */

import * as d3 from 'd3'
import _ from 'lodash'



const src = 'from'
const dest = 'to'
const value = 'patient'

const getArcList = function (data) {
    const arcs = _.uniq(_.map(data, src))
    return arcs
}

const dataToMatrix = function (data) {
    const matrixMaker = (m, n) => Array.from(Array(m), () => new Array(n))
    const groupedData = _.map(_.groupBy(data, src))
    const dim = groupedData.length
    const matrix = matrixMaker(dim, dim)

    _.each(groupedData, (rowData, rowIndex) => {
        _.each(rowData, (colData, colIndex) => {
            matrix[rowIndex][colIndex] = parseInt((colData[value]).replace(/\D/g, ''))
        })
    })
    return matrix
}

// Set the viewport container
const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
},
    viewportWidth = 1200,
    viewportHeight = 800,
    width = viewportWidth - margin.left - margin.right,
    height = viewportHeight - margin.top - margin.bottom

let svg = d3.select('.svg__chord')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

svg = svg.append('g')
    .attr('transform', `translate(${margin.left + (width) / 2}, ${margin.top + (height) / 2})`)


// Set pre-requisites
// Radius
const outerRadius = (Math.min(height, width)) * .5 - 50
const innerRadius = outerRadius - 30

const defaultColorScheme = ["red", "orange", "yellow", "blue", "green"]
const defaultOpacity = 1

// Get the matrix and nodes
const data = [
    {
        "from": 1,
        "to": 1,
        "patient": "512,123",
        "patient__1": "0.02%"
    },
    {
        "from": 1,
        "to": 2,
        "patient": "4,724,812",
        "patient__1": "0.21%"
    },
    {
        "from": 1,
        "to": 3,
        "patient": "10,962,715",
        "patient__1": "0.48%"
    },
    {
        "from": 1,
        "to": 4,
        "patient": "7,372,894",
        "patient__1": "0.32%"
    },
    {
        "from": 1,
        "to": 5,
        "patient": "788,549",
        "patient__1": "0.03%"
    },
    {
        "from": 2,
        "to": 1,
        "patient": "4,674,155",
        "patient__1": "0.20%"
    },
    {
        "from": 2,
        "to": 2,
        "patient": "64,111,341",
        "patient__1": "2.79%"
    },
    {
        "from": 2,
        "to": 3,
        "patient": "161,022,953",
        "patient__1": "7.00%"
    },
    {
        "from": 2,
        "to": 4,
        "patient": "111,861,687",
        "patient__1": "4.86%"
    },
    {
        "from": 2,
        "to": 5,
        "patient": "12,217,544",
        "patient__1": "0.53%"
    },
    {
        "from": 3,
        "to": 1,
        "patient": "10,904,350",
        "patient__1": "0.47%"
    },
    {
        "from": 3,
        "to": 2,
        "patient": "162,186,494",
        "patient__1": "7.05%"
    },
    {
        "from": 3,
        "to": 3,
        "patient": "461,101,828",
        "patient__1": "20.04%"
    },
    {
        "from": 3,
        "to": 4,
        "patient": "345,865,671",
        "patient__1": "15.03%"
    },
    {
        "from": 3,
        "to": 5,
        "patient": "39,889,543",
        "patient__1": "1.73%"
    },
    {
        "from": 4,
        "to": 1,
        "patient": "7,291,370",
        "patient__1": "0.32%"
    },
    {
        "from": 4,
        "to": 2,
        "patient": "113,081,724",
        "patient__1": "4.92%"
    },
    {
        "from": 4,
        "to": 3,
        "patient": "347,840,179",
        "patient__1": "15.12%"
    },
    {
        "from": 4,
        "to": 4,
        "patient": "298,378,276",
        "patient__1": "12.97%"
    },
    {
        "from": 4,
        "to": 5,
        "patient": "38,718,475",
        "patient__1": "1.68%"
    },
    {
        "from": 5,
        "to": 1,
        "patient": "755,004",
        "patient__1": "0.03%"
    },
    {
        "from": 5,
        "to": 2,
        "patient": "12,126,692",
        "patient__1": "0.53%"
    },
    {
        "from": 5,
        "to": 3,
        "patient": "39,603,590",
        "patient__1": "1.72%"
    },
    {
        "from": 5,
        "to": 4,
        "patient": "38,398,642",
        "patient__1": "1.67%"
    },
    {
        "from": 5,
        "to": 5,
        "patient": "6,283,063",
        "patient__1": "0.27%"
    }
]

const nodes = getArcList(data)
const matrix = dataToMatrix(data)


// Chords, Arcs and Ribbons

const chordGenerator = d3.chord()
    .padAngle(0.1)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending)
    .sortGroups(d3.descending)

const chord = chordGenerator(matrix)
console.info(chord)

const arcs = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

const ribbon = d3.ribbon()
    .radius(innerRadius - 15)


const color = d3.scaleOrdinal()
    .domain([0, nodes.length - 1])
    .range(defaultColorScheme)

//  Draw the arcs
const group = svg.datum(chord)
    .append('g')
    .selectAll('g')
    .data(d => d.groups)
    .enter()
    .append("g")
    .attr('class', 'group')

group.append('path')
    .style('fill', d => color(d.index))
    .attr('d', arcs)
    .style('opacity', defaultOpacity)

// Draw the ribbons

svg.datum(chord)
    .append('g')
    .selectAll('path')
    .data(d => d)
    .enter()
    .append('path')
    .attr('d', ribbon)
    .style('fill', d => color(d.source.index))
    .attr('class', d => {
        return `chord chord-${d.source.index} chord-${d.target.index}`
    })















