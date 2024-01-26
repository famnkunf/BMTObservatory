import * as React from 'react';
import { Socket } from 'socket.io-client';
import Indicator from '../Indicator';

interface EventCallbackParams<T> {
  socket: Socket;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
  data: T[];
}

export interface RealtimeIndicatorProps<T> {
  name: string;
  title?: string;
  on: string;
  off: string;
  socket?: Socket;
  eventName: string;
  eventCallback: (params: EventCallbackParams<T>) => void;
  onClick?: (setStatus: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

function RealtimeIndicator<T extends any = any>(props: RealtimeIndicatorProps<T>) {
  const [status, setStatus] = React.useState(false);

  React.useEffect(() => {
    const socket = props.socket;
    if (!socket) return;

    function callback(...data: T[]) {
      props.eventCallback({
        socket: socket!,
        setStatus,
        data,
      });
    }

    socket.on(props.eventName, callback);
    return () => {
      socket.off(props.eventName, callback);
    }
  }, [props.socket, props.eventName, props.eventCallback]);

  return <Indicator
    name={props.name}
    title={props.title}
    off={props.off}
    on={props.on}
    onClick={() => {
      if (!props.onClick) return;
      props.onClick(setStatus);
    }}
    status={status}
  />;
}

export default RealtimeIndicator;
