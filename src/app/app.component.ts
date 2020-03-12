import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { HistogramDistribution } from './model';
import { testData } from './test-data';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

dataCount = [10, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500,750,850, 889]
sliceValue = 10;

title = 'stacked-bar-plot';

ngOnInit() {

  const hist: HistogramDistribution[] = testData;
  this.drawSvg(hist.slice(0,this.sliceValue));
}

 drawSvg( data: HistogramDistribution[] ): void {

 d3.select("svg").remove();

 data = testData.slice(0,this.sliceValue)
 const margin = {top: 60, right: 10, bottom: 60, left: 60};
 const width = 960 - margin.right - margin.left;
 const height = 600 - margin.top - margin.bottom;



 const svg = d3.select('body').append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

 const g = svg.append('g');
 g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

              // set x scale
 const x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1).paddingOuter(0.5).align(0.1);

              // set y scale
 const y = d3.scaleLinear().rangeRound([height, 0]);

              // set the colors
 const z = d3.scaleOrdinal().range([ 'msgdelivered' ,  'msgundelivered', 'msgenroute', 'msgexpired' ]);
 const keys = [ 'delivered', 'undeliverable', 'enroute', 'expired' ];

 x.domain(data.map(function(d) { return new Date(d.dateRange); }));
 y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
 z.domain(keys);


              // Define the div for the tooltip
 const div = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);


 g.append('g')
              .selectAll('g')
              .data(d3.stack().keys(keys)(data))
              .enter().append('g')
              // tslint:disable-next-line:only-arrow-functions
              .attr('class', d => z(d.key))
              .selectAll('rect')
                  .data(d => d )
                  .enter().append('rect')
                  .transition().duration(1000)
                  .delay((d, i) => i * 20)
                  // .transition()
                  // .duration(500)
                  // .delay((d, i) => i * 20)
                  .attr('x', d =>
                     x(new Date(d.data.dateRange))
                    )
                  .attr('y', function(d) {
                    return y(d[1]); }
                    )
                  .attr('height', function(d) { return y(d[0]) - y(d[1]); })
                  .attr('width', x.bandwidth())
                  .attr('y', (d: any) => {
                    return y(d[1]);
                  });

                  g.selectAll('rect')
                  .on('mouseover', function(d) {
                    const hist: HistogramDistribution = this.__data__.data;
                    const xPosition = d3.mouse(this)[0] - 5;
                    const yPosition = (d3.mouse(this)[1] - 5 );

                    div.transition()
                        .duration(10)
                        .style('opacity', .9);
                    div.html( '<span>' + 'Date : '  + hist.dateRange + '</span><br>' +
                        '<span>' + 'Delivered : '  + hist.delivered + '</span><br>' +
                        '<span>' + 'Undeliverable : '  + hist.undeliverable + '</span><br>' +
                        '<span>' + 'Expired : '  + hist.expired + '</span><br>' +
                        '<span>' + 'Enroute : '  + hist.enroute + '</span><br>' +
                        '<span>' + 'Total : '  + hist.total + '</span>'
                        )
                        .style('left', (d3.event.pageX) - 45 + 'px')
                        .style('top', (d3.event.pageY - 100) + 'px');
                    }
                  )
                  .on('mouseout', function(d) {
                    div.transition()
                        .duration(500)
                        .style('opacity', 0);
                  })
                  .on('mousemove', function(d) {

                   const hist: HistogramDistribution = this.__data__.data;
                   const xPosition = d3.mouse(this)[0] - 5;
                   const yPosition = ( d3.mouse(this)[1] - 5 );

                   div.transition()
                        .duration(10)
                        .style('opacity', .9);
                   div.html( '<span>' + 'Date : '  + hist.dateRange + '</span><br>' +
                        '<span>' + 'Delivered : '  + hist.delivered + '</span><br>' +
                        '<span>' + 'Undeliverable : '  + hist.undeliverable + '</span><br>' +
                        '<span>' + 'Expired : '  + hist.expired + '</span><br>' +
                        '<span>' + 'Enroute : '  + hist.enroute + '</span><br>' +
                        '<span>' + 'Total : '  + hist.total + '</span>'
                        )
                        .style('left', (d3.event.pageX) - 45 + 'px')
                        .style('top', (d3.event.pageY - 100) + 'px');
                    }

                  );




                 // d3.timeDay.every(4)

 let calculateTicksFn = (d,i) => this.calculateTicks(data, d,i);                
 const xAxis = d3.axisBottom(x);
  xAxis.tickValues(x.domain().filter( 
   calculateTicksFn
  ));

 xAxis.tickFormat(d3.timeFormat("%d-%b-%y"));
 

 g.append('g')
                  .attr('class', 'axis')
                  .attr('transform', 'translate(0,' + height + ')')
                  .transition()
                  .duration(1000).delay(1000)
                  .call(xAxis)
                  .selectAll('text')
                    .style('text-anchor', 'middle')
                    .attr('dx', '3em')
                    .attr('dy', '1em')
                    .attr('transform', 'rotate(30)');

                    const yAxis =   g.append('g')
                                      .attr('class', 'axis')

       // const yAxis1 = d3.axisLeft(y);

            yAxis
                .attr('class', 'axis')
                .append('text')
                .attr('x', 2)
                .attr('y', y(y.ticks().pop()) + 0.5)
                .attr('dy', '0.32em')
                .attr('fill', '#000')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'start');

                yAxis.transition().duration(2000)
                    .call(d3.axisLeft(y));

 const legend = g.append('g')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 10)
                .attr('text-anchor', 'end')
                .selectAll('g')
                .data(keys.slice())
                .enter().append('g')
                .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

 legend.append('rect')
                .attr('x', width - 19)
                .attr('width', 19)
                .attr('height', 19)
                .attr('class', function(d) {
                  return z(d);
                });

 legend.append('text')
                .attr('x', width - 24)
                .attr('y', 9.5)
                .attr('dy', '0.32em')
                .text(function(d) {
                 return d.charAt(0).toUpperCase() + d.slice(1) ; });

                // text label for the x axis
                // svg.append("text")
                //     .attr("transform",
                //           "translate(" + (width/2) + " ," +
                //                          (height + margin.top + 20) + ")")
                //     .style("text-anchor", "middle")
                //     .text("Date");

                  // text label for the y axis
 g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left)
          .attr('x', 0 - (height / 2))
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Count');


}

redrawSvg() {
  this.drawSvg( testData.slice(0,this.sliceValue))
}

 calculateTicks( data , d,i ) {

  let divider = 3;

  if(data.length <= 10){
    divider = 1;
  } else if( data.length > 10  && data.length <= 50) {
     divider = 3;
  } else if( data.length > 50  && data.length <= 100 ) {
    divider = 10;
  } else if( data.length > 100 && data.length <= 150) {
    divider = 15;
  } 
  else if( data.length > 150 && data.length <= 200) {
    divider = 20;
  } else if (data.length > 200 && data.length <= 250 ) {
    divider = 25;
  } else if ( data.length > 250 && data.length <= 300) {
    divider = 30;
  } else if ( data.length > 300 && data.length <= 350) {
    divider = 35;
  } else if ( data.length > 350 && data.length <= 400 ) {
    divider = 40;
  } else if ( data.length > 400 && data.length <= 450 ) {
    divider = 45;
  } else if ( data.length > 450 && data.length <= 500 ) {
    divider = 50;
  } else if( data.length >500 && data.length <= 800) {
    divider = 75;
  } else if( data.length > 800 && data.length <= 889) {
    divider = 90;
  } 

  console.log(!(i % divider));
  return !(i % divider); 
}


}
