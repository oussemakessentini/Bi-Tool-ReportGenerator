import axios from 'axios';
import chartRender from '../Charts/Chart.js';
import puppeteer from 'puppeteer';
import cubejs from "@cubejs-client/core";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const generatePdf = async (req, res) => {
  const id = req.params.id;

  try {
    const response = await axios.get(`http://localhost:5000/dashboard/getDashboardWithElements/${id}`);
    const { dashboard, elements } = response.data;

    const dashboardHtml = await generateDashboardHTML(dashboard, elements);
    fs.writeFileSync('chart.html', dashboardHtml);
    const pdfBuffer = await generatePdfBuffer(dashboardHtml);

    const currentDate = new Date().toISOString().slice(0, 10);
    const filename = `${dashboard[0].title}_${currentDate}.pdf`;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pdfPath = path.join(__dirname,  filename);
    console.log(pdfPath);
    fs.writeFileSync(pdfPath, pdfBuffer);
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    console.log('PDF saved: output.pdf');

  } catch (error) {
    console.error('Error fetching data from the API:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

async function generatePdfBuffer(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.setContent(html);
  
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
  
    await browser.close();
  
    return pdfBuffer;
  }


async function generateDashboardHTML(dashboard, elements) {
    const { title , header, footer} = dashboard[0];
    const chartElementsHtml = await generateChartElements(elements);
    const dashboardHtml = `
      <!DOCTYPE html>
      <html>
        <head>
        <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }

    h1 {
      font-size: 24px;
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }

    .header {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }

    .chart-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }

    .chart {
      width: 600px;
      height: 450px;
      margin: 10px;
      padding: 10px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    .chart img {
      width: 100%;
      height: auto;
    }

    .tablee {
      width: 100%;
      height: auto;
      margin: 10px;
      padding: 10px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f0f0f0;
    }

    .number {
      width: 200px;
      height: 200px;
      margin: 10px;
      padding: 10px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    

 
    .title {
      font-size: 20px;
      color: #333;
      margin-bottom: 10px;
      text-align: center;
    }

    .footer {
      font-size: 14px;
      color: #777;
      text-align: center;
      margin-top: 40px;
    }
  </style>
          <title>${title}</title>
          <!-- Add any necessary CSS or scripts here -->
        </head>
        <body>
          <h1>${title}</h1>
            <div class="header">
                <p>${header}</p>
            </div>
            <div class="chart-container">
                ${chartElementsHtml}
            </div>
            <div class="footer">
                <p>${footer}</p>
            </div>
        </body>
      </html>
    `;
  
    return dashboardHtml;
}

async function generateChartElements(elements) {
    let chartElementsHtml = '';
    const cubejsApi = cubejs.default({
        apiUrl: 'http://localhost:4000/cubejs-api/v1',
      });
    for (const element of elements) {
      const { id, name, vizstate, layout, dashboardId } = element;
      const { query, chartType } = JSON.parse(vizstate);
  
      try {
        const resultSet = await cubejsApi.load(query);
  
        if (chartType === 'bar' || chartType === 'line' || chartType === 'area' || chartType === 'pie') {
          const svgChart = await chartRender(chartType, resultSet); 
          chartElementsHtml += `
            <div class="chart">
              <h2 class="title">${element.name}</h2>
              
              <img src=${svgChart}>
              
            </div>
          `;
        } else if (chartType === 'table') {
            chartElementsHtml += `
            <div class="tablee">
              <h2 class="title">${element.name}</h2>
              <table>
                <thead>
                  <tr>
                    <!-- Generate table header -->
                    ${resultSet.tableColumns().map((column) => `<th>${column.title}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <!-- Generate table rows -->
                  ${resultSet.tablePivot().map((row) => `
                    <tr>
                      ${resultSet.tableColumns().map((column) => `<td>${row[column.key]}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
        } else if (chartType === 'number') {
            chartElementsHtml += `
            <div class="number">
              <h2 class="title">${element.name}</h2>
              
                <!-- Iterate over series names -->
                ${resultSet.seriesNames().map((series) => `
                  
                    <h4>${series.title}</h4>
                    <p>${resultSet.totalRow()[series.key]}</p>
                  
                `).join('')}
              
            </div>
          `;
        }
      } catch (error) {
        console.error('Error fetching data from the Cube.js API:', error);
      }
    }
  
    return chartElementsHtml;
  }
