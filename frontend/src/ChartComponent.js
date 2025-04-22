import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto'
import { CategoryScale} from 'chart.js';
import { Chart, Bar } from 'react-chartjs-2';

const GraphComponent = ({ question, answers }) => {

  ChartJS.register(CategoryScale);

  const chartData = {
    labels: Object.keys(answers),
    datasets: [
      {
        label: "Question: " + question,
        data: Object.values(answers),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: '500px', height: '400px'}}>
      <h2>{question}</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default GraphComponent;
