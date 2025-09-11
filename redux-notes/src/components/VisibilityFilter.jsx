import { filterChange } from "../reducers/filterReducer.js";
import { useDispatch, useSelector } from "react-redux";

const VisibilityFilter = (props) => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state) => state.filter);
  const handleOptions = (evt) => dispatch(filterChange(evt.target.value));

  return (
    <div>
      <label htmlFor="all">all</label>
      <input
        type="radio"
        name="filter"
        id="all"
        value="ALL"
        checked={currentFilter === "ALL"}
        onChange={handleOptions}
      />
      <label htmlFor="important">important</label>
      <input
        type="radio"
        name="filter"
        id="important"
        value="IMPORTANT"
        checked={currentFilter === "IMPORTANT"}
        onChange={handleOptions}
      />
      <label htmlFor="nonimportant">nonimportant</label>
      <input
        type="radio"
        name="filter"
        id="nonimportant"
        value="NONIMPORTANT"
        checked={currentFilter === "NONIMPORTANT"}
        onChange={handleOptions}
      />
    </div>
  );
};

export default VisibilityFilter;
