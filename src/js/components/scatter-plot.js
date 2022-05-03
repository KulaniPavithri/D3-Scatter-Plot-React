import { setSelectionRange } from "@testing-library/user-event/dist/utils";
import React from "react";
import * as d3 from "d3";
import "../styles/scatter-plot.css";

const ScatterPlot = () => {

    const [data, setData] = React.useState (null);

    const width = 800;
    const height = 400;
    const padding = 100;

    React.useEffect (() =>{
        try{
            fetch('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
                .then(response => response.json())
                .then((result) => {
                    setData(result);
                    console.log(result);
                });
        } catch( error ) {
            console.log (error);
        }
    }, []);

    React.useEffect(() => {
        if(data !== null) {
            console.log ("data");
            data.forEach((d) => {
                let parsedTime = d.Time.split(":");
                d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
            });
            createScatterPlot();
        }
    }, [data]);

    const createScatterPlot = () => {

        let keys = ["color1", "color2", "color3", "color4"];
        let colors = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(keys);
        
        let tooltip = d3.select("#scatter-plot").append("div")
            .attr("id", "tooltip").style("opacity", 0);
        //console.log(colors("color4"));

        let svgArea = d3.select("#scatter-plot").append("svg")
            .attr("height", height + padding)
            .attr("width", width + padding);

        svgArea.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -160)
            .attr('y', 10)
            .style('font-size', 15)
            .text('Time in Minutes');
            svgArea.append("text")
            .attr('class', 'x-axis-label')
            .attr("x", width-(padding/5))
            .attr('y', (height + padding))
            .style('text-anchor', 'end')
            .style('font-size', 15)
            .text("Year");

        let yearDate = data.map ((item) => (item.Year));

        let xMax = (d3.max(yearDate));
        //console.log(d3.min(yearDate));

        let xScale = d3.scaleLinear()
            .domain([d3.min(data, (d) => {
                return d.Year - 1;
            }) , xMax + 1])
            .range([0, width]);
        
        let xAxis = d3.axisBottom().scale(xScale)
            .tickFormat(d3.format('d')); //this format remove ',' from 2,005

        svgArea.append("g")
            .attr('transform', 'translate(' + padding / 2 + "," + (height + padding / 2) + ')')
            .attr("id", "x-axis")
            .call(xAxis);

        let yScale = d3.scaleTime().domain(
            d3.extent(data, (d) => {
                return d.Time;
            })
        ).range([0, height]);

        let timeFormat = d3.timeFormat('%M:%S');
        let yAxis = d3.axisLeft().scale(yScale).tickFormat(timeFormat);

        svgArea.append("g")
            .attr("id", "y-axis")
            .call(yAxis)
            .attr("transform", "translate(" + padding / 2 + ", " + ( padding / 2) + ")");
        
        svgArea.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("cx", (d) => {
                return xScale(d.Year) + padding / 2;
            }) 
            .attr("cy", (d) => {
                return yScale(d.Time) + padding / 2;
            })
            .attr('data-xvalue', function (d) {
                return d.Year;
            })
            .attr('data-yvalue', function (d) {
                return d.Time.toISOString();
            })
            .style("fill", (d) => {
                if(d.Doping !== ""){
                    return colors("color4")
                } else return colors("color3");
            }).on("mouseover", (event, d) => {
                tooltip.style("opacity", 0.8);
                tooltip.attr('data-year', d.Year);
                tooltip.html(d.Name + ": " + 
                    d.Nationality + 
                    '<br/>' +
                    'Year: ' +
                    d.Year +
                    ', Time: ' +
                    timeFormat(d.Time) + 
                    (d.Doping ? '<br/><br/>' + d.Doping : '')
                )
                .style('left', event.pageX + 'px')
                .style('top', event.pageY - 28 + 'px');
            }).on("mouseout", () =>{
                return tooltip.style("opacity", 0);
            });

            let colorLegend = ["green", "red"];
            let legendLables = ["No doping allegations", "Riders with doping allegations"];
            
            let legendContainer = svgArea.append('g').attr('id', 'legend');

            let legend = legendContainer
                .selectAll('#legend')
                .data(legendLables)
                .enter()
                .append('g')
                .attr('class', 'legend-label')
                .attr('transform', function (d, i) {
                return 'translate(0,' + (height / 2 - i * 20) + ')';
                });


            legend
                .append('rect')
                .attr('x', width - 18)
                .attr('width', 18)
                .attr('height', 18)
                .style('fill', (d, i) => colorLegend[i]);
                

            legend
                .append('text')
                .attr('x', width - 24)
                .attr('y', 9)
                .attr('dy', '.35em')
                .style('text-anchor', 'end')
                .text( (d) => d);

        
    }

    return (
        <div>
            <div id='main'>
                <div id='container'>
                    <div id='title'>Doping in Professional Bicycle Racing</div>
                    <div id="sub-title">35 Fastest times up Alpe d'Huez</div>
                    <div id='scatter-plot'></div>
                </div>
            </div>
        </div>
    );
}

export default ScatterPlot;