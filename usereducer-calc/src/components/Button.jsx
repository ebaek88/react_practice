import { useCounterDispatch } from "../CounterContext.jsx";

const Button = ({ type, label }) => {
  const dispatch = useCounterDispatch();
  return <button onClick={() => dispatch({ type })}>{label}</button>;
};

export default Button;
