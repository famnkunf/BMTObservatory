import React from "react";
import classes from "./Indicator.module.css";

export type IndicatorProps = {
  status: boolean;
  name?: string;
  on?: string;
  off?: string;
  onClick?: () => void;
  title?: string;
};


function Indicator(props: IndicatorProps) {
  return (
    <>
      <div className={classes.box} onClick={props?.onClick} title={props?.title}>
        {props.name && <span className={classes.text}>{props.name}</span>}
        {props.on && props.off && <span className={classes.status}>{props.status ? props.on : props.off}</span>}
        <RawIndicator status={props.status} />
      </div>
    </>
  );
}

export function RawIndicator(props: {
  status: boolean;
}) {
  const color = props.status ? "#00ff00" : "#ff0000";

  return <svg width="15px" height="15px">
    <circle cx="50%" cy="50%" r="30%" stroke={color} strokeWidth="1" fill={color} />
  </svg>;
}

export default Indicator;