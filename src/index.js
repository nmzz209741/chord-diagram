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
const value = 'referrals'

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

const chordReader = function (matrix, nodes) {
    return function (d) {
        let source_index, target_index, group_index, map = {}
        if (d.source) {
            source_index = d.source.index
            target_index = d.target.index

            map.source_title = nodes[source_index]
            map.target_title = nodes[target_index]

            map.source_data = d.source.value
            map.source_value = +(map.source_data)
            map.source_total = _.reduce(matrix[source_index], (total, n) => { return total + n }, 0)

            map.target_data = d.target.value
            map.target_value = +(map.target_data)
            map.target_total = _.reduce(matrix[target_index], (total, n) => { return total + n }, 0)

        } else {
            map.group_name = nodes[d.index]
            map.group_value = d.value
        }

        map.map_total = _.reduce(matrix, (rowTotal, row) => {
            return rowTotal + _.reduce(row, (columnTotal, column) => {
                return columnTotal + column
            }, 0)
        }, 0)

        return map

    }
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
    const reader = chordReader(matrix, nodes)
    console.info(chord)

    const arcs = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)

    const ribbon = d3.ribbon()
        .radius(innerRadius - 15)


    const color = d3.scaleOrdinal()
        .domain([0, nodes.length - 1])
        .range(defaultColorScheme)

    // Tooltip
    // Defining tooltip
    const tooltip = d3.select('.svg__chord')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('font-size', '16px')
        .style('background-color', '#aaa')
        .style('padding', '0.5em')
        .style('border-radius', '15%')
        .style('position', 'absolute')

    const chordInfo = d => {
        const srcValue = d.source_value
        const targetValue = d.target_value
        const totalChordValue = srcValue + targetValue
        const sourceName = d.source_title
        const targetName = d.target_title
        const percentageFormat = d3.format('.2%')
        const valueFormat = number => number.toLocaleString()

        const sourcePercentage = percentageFormat(srcValue / totalChordValue)
        const targetPercentage = percentageFormat(targetValue / totalChordValue)

        const srcStatement = `(${sourcePercentage}) i.e., ${valueFormat(srcValue)} ${value} from ${sourceName} went to ${targetName}`
        const targetStatement = `(${targetPercentage}) i.e., ${valueFormat(targetValue)} ${value} from ${targetName} went to ${sourceName}`
        const isEqual = sourceName === targetName

        return `<div class='chord-info' style="color: white; font-size: 12px;"><span>Chord Info:<br/> ${srcStatement}<br/>${isEqual ? '' : targetStatement}</span></div>`
    }

    const arcInfo = d => {
        const arcValue = d.group_value
        const mapTotal = d.map_total
    
        const percentageFormat = d3.format('.2%')
        const arcPercentage = percentageFormat(arcValue/mapTotal)

        return `<div class='arc-info' style="color: white; font-size: 12px;"><span>Arc Info:<br/>${(arcValue).toLocaleString()} ${value}<br/>(${arcPercentage}) of total ${value} i.e., ${(mapTotal).toLocaleString()}</span></div>`

    }

    const mousemove = function (d) {
        tooltip
            .style("left", `${d3.event.pageX}px`)
            .style("top", `${d3.event.pageY}px`)
    }

    const mouseleave = d => {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    const mouseoverChord = function (d) {
        tooltip.transition().duration(200).style('opacity', 1)
        tooltip.html(chordInfo(reader(d)))
            .style('left', `${d3.event.pageX}px`)
            .style('top', `${d3.event.pageY}px`)
    }

    const mouseoverArc = function (d) {
        tooltip.transition().duration(200).style('opacity', 1)
        tooltip.html(arcInfo(reader(d)))
            .style('left', `${d3.event.pageX}px`)
            .style('top', `${d3.event.pageY}px`)
    }
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
        .on('mouseover', d => mouseoverArc(d))
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)

    // Add labels
    group.append('text')
        .each(d => d.angle = (d.startAngle + d.endAngle) / 2)
        .attr('dy', '0.3em')
        .attr('class', 'labels')
        .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (outerRadius + 10) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function (d, i) { return nodes[i]; })
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
        .on('mouseover', d => mouseoverChord(d))
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
})

