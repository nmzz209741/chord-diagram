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

d3.json('./data.json').then(function (data) {
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
    // Add labels

    group.append('text')
        .each(d=> d.angle = (d.startAngle +d.endAngle)/2)
        .attr('dy', '0.3em')
        .attr('class', 'labels')
        .attr('text-anchor', d => d.angle > Math.PI? 'end': null)
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (outerRadius + 10) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
          })
          .text(function(d,i){ return nodes[i]; })
          .style("font-size", "15px")
          
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
    
})

