import * as React from 'react';
import { Line } from 'react-chartjs-2';
import { Socket } from 'socket.io-client';

function TemperatureChart(props: {
  socket?: Socket;
}) {
  const [temperatureData, setTemperatureData] = React.useState<{
    time: Date;
    data: number;
  }[]>([]);

  React.useEffect(() => {
    const socket = props.socket;
    if (!socket) return;

    function callback(data: Application.RealtimeData[]) {
      const transformed = data.map(dataObj => {
        return {
          data: dataObj.temperature,
          time: new Date(dataObj.time),
        }
      }).sort((x, y) => {
        return x.time.getTime() - y.time.getTime()
      });
      setTemperatureData(transformed);
    }

    socket.on("data", callback);
    return () => {
      socket.off("data", callback);
    }
  }, [props.socket]);


  return <Line
    data={{
      labels: temperatureData.map(data => data.time.toLocaleTimeString()),
      datasets: [
        {
          label: 'Temperature',
          data: temperatureData.map(data => data.data),
          fill: false,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255,99,132,1)'
        }
      ]
    }}
    options={
      {
        scales: {
          y: {
            min: 0,
            max: 70,
            display: true,
            title: {
              display: true,
              text: 'Temperature °C'
            }
          }
        }
      }
    }
  />;
}

export default TemperatureChart;
