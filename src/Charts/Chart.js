import * as echarts from 'echarts';

const ChartOptions = (charttype, resultSet) => {
  
  
    switch (charttype) {
        case 'line' : 
          return {
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: resultSet.series().map(series => series.title)
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
            
              type: 'category',
              boundaryGap: false,
              data: resultSet.chartPivot().map(chart => chart.xValues)
            },
            yAxis: {
              type: 'value'
            },
            series: resultSet.series().map(series => ({
              data : series.series.map(series => series.value),
              name : series.title,
              type : charttype,
              stack : 'Total'
            }))
          };
        case 'area' : 
          return {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#6a7985'
                }
              }
            },
            legend: {
              data: resultSet.series().map(series => series.title)
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: resultSet.chartPivot().map(chart => chart.xValues)
            },
            yAxis: {
              type: 'value'
            },
            series: resultSet.series().map(series => ({
              data : series.series.map(series => series.value),
              name : series.title,
              type : 'line',
              stack : 'Total',
              areaStyle : {},
              emphasis :{
                focus: 'series'
              }
            }))
    
          };
        case 'bar' : 
          return {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
                label: {
                  show: true
                }
              }
            },
            legend: {
              data: resultSet.series().map(series => series.title)
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              axisTick: {
                alignWithLabel: true
              },
              data: resultSet.chartPivot().map(chart => chart.x)
            },
            yAxis: {
              type: 'value'
            },
            series: resultSet.series().map(series => ({
              data : series.series.map(series => series.value),
              name : series.title,
              type : charttype
            }))
    
          };
        case 'pie' : 
          return {
            tooltip: {
              trigger: 'item'
            },
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: resultSet.series().map(series => ({
              data : series.series.map(serie =>({value :serie.value , name : serie.x}) ),
              name : series.title,
              type : charttype,
              radius: '50%',
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }))
    
          };
        default: 
          return null;  
    
      }
}  
const chartRender = (chartType, resultSet) => {
    return new Promise((resolve, reject) => {
      try {
        const chart = echarts.init(null, null, {
          renderer: 'svg',
          ssr: true,
          width: 600,
          height: 400
        });
        const option = ChartOptions(chartType, resultSet);
        chart.setOption(option);
        //const svgString = chart.renderToSVGString();
        const image = chart.getSvgDataURL();
        resolve(image);
      } catch (error) {
        reject(error);
      }
    });
  };

export default chartRender;