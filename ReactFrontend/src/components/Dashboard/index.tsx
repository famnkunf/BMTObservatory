import React, { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import './index.css'
import Indicator, { RawIndicator } from '../Indicator'
import { Socket, io } from 'socket.io-client'
import { Chart as ChartJs, LinearScale, PointElement, CategoryScale, LineElement } from 'chart.js'
import RealtimeIndicator from '../RealtimeIndicator'
import RoofIndicator from '../RoofIndicator'
import TemperatureChart from '../TemperatureChart'
import HumidityChart from '../HumidityChart'
import RainChart from '../RainChart'
import ReactDOM from 'react-dom'


function Dashboard() {
  const [socket, setSocket] = useState<Socket>();
  const [dataNum, setDataNum] = useState<number>(10);
  const roofAlert = document.getElementById("#roofAlert");

  ChartJs.register(LinearScale, PointElement, CategoryScale, LineElement);

  React.useEffect(() => {
    const socket = io('wss://famnkunf.xyz:5555/');
    socket.on('connect', () => {
      setSocket(socket);
      socket.emit("clientType", "web")
    });
    socket.on('disconnect', () => {
      setSocket(undefined);
    });
    socket.on('connect_error', (err: any) => {
      socket.connect();
      setSocket(undefined);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    function doUpdate() {
      socket?.emit("status");
      socket?.emit("data", dataNum);
    }

    doUpdate();
    const interval = setInterval(doUpdate, 5000);
    return () => {
      clearInterval(interval);
    }
  }, [socket, dataNum]);


  const StatusIndicator = RealtimeIndicator<boolean>;

  return (
    <>
      <div id="roofAlert"></div>
      <div id="preventClick"></div>
      <header>
        <h1>Dashboard</h1>
        <RawIndicator
          status={socket?.connected ?? false}
        />
      </header>
      <input type="number" value={dataNum} onChange={(e) => {
        setDataNum(parseInt(e.target.value));
      }} />
      <StatusIndicator
        name={"Current status"}
        on="Online"
        off="Offline"
        eventName="status"
        socket={socket}
        eventCallback={(params) => {
          params.setStatus(true);
        }}
      />
      <RoofIndicator socket={socket} refresh={() => {
        
      }}></RoofIndicator>

      <div style={{ marginBottom: '3%' }}>
        <div style={{ width: '100%', height: '400px', marginTop: '3%', display: 'flex', justifyContent: 'center' }}>
          <TemperatureChart socket={socket}></TemperatureChart>
        </div>
        <div style={{ width: '100%', height: '400px', marginTop: '3%', display: 'flex', justifyContent: 'center' }}>
          <HumidityChart socket={socket}></HumidityChart>
        </div>
        <div style={{ width: '100%', height: '400px', marginTop: '3%', display: 'flex', justifyContent: 'center' }}>
          <RainChart socket={socket}></RainChart>
        </div>
      </div>
    </>
  )
}

export default Dashboard