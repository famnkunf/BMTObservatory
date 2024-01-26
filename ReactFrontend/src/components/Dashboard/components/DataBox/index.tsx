import './index.css';


type DataProps = {
  name: string;
  value: any;
  unit: string;
};

function Data(props: DataProps) {
  return (
    <>
        <div className='box'>
            <span className='box-title'>{props.name}: </span>
            <span className='box-value'>{props.value} {props.unit}</span>
        </div>
    </>
  );
}

export default Data;
