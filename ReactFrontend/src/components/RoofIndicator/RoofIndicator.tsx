import * as React from 'react';
import { Socket } from 'socket.io-client';
import Indicator from '../Indicator';
import Alert from '@mui/material/Alert';
import classes from './RoofIndicator.module.css';

interface RoofIndicatorProps {
  socket?: Socket;
  refresh(): void;
}

function RoofIndicator(props: RoofIndicatorProps) {
  const [isInteracting, setIsInteracting] = React.useState<boolean>(false);
  const [roofOpen, setRoofOpen] = React.useState<boolean>(false);
  const [alert, setAlert] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const createAlert = React.useCallback((message: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAlert(message);
    timeoutRef.current = setTimeout(() => {
      setAlert(null);
    }, 5000);
  }, []);

  React.useEffect(() => {
    const socket = props.socket;
    if (!socket) return;
    socket.on("roofReady", (opened: boolean) => {
      setIsInteracting(false);
      setRoofOpen(opened);
    });
    props.refresh();
  }, [props.socket, props.refresh]);

  React.useEffect(() => {
    const socket = props.socket;
    if (!socket) return;
    socket.on("data", (data: Application.RealtimeData[]) => {
      const transformed = data.map(dataObj => {
        return {
          ...dataObj,
          time: new Date(dataObj.time),
        }
      }).sort((x, y) => {
        return x.time.getTime() - y.time.getTime();
      });
      if (!isInteracting){
        setRoofOpen(transformed.at(-1)!.roof);
      }
    });
    props.refresh();
  }, [props.refresh, props.socket]);

  return <div>
    <Indicator
      status={roofOpen}
      name={"Roof Status"}
      on="Opened"
      off="Closed"
      onClick={() => {
        const socket = props.socket;
        if (!socket?.connected) {
          createAlert("Not connected to server.");
          return;
        };
        if (isInteracting) {
          createAlert("Please wait for the roof to finish moving before interacting again.");
          return;
        }
        setIsInteracting(true);
        console.log("Emitting roofStatus", !roofOpen ? "1" : "0")
        props.socket?.emit("roofStatus", !roofOpen ? "1" : "0");
      }}
      title="Open/Close the Roof"
    />
    {
      alert && <div className={classes.alertContainer}>
        <Alert className={classes.alert} severity="info">{alert}</Alert>
      </div>
    }
  </div>;
}

export default RoofIndicator;
