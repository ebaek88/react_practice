import { filterChange } from "../reducers/filterReducer.js";
import { useDispatch, useSelector } from "react-redux";

const VisibilityFilter = (props) => {
  const dispatch = useDispatch();
  const currentFilter = useSelector((state) => state.filter);

  return (
    <div>
      <label htmlFor="all">all</label>
      <input
        type="radio"
        name="filter"
        id="all"
        checked={currentFilter === "ALL"}
        onChange={() => dispatch(filterChange("ALL"))}
      />
      <label htmlFor="important">important</label>
      <input
        type="radio"
        name="filter"
        id="important"
        checked={currentFilter === "IMPORTANT"}
        onChange={() => dispatch(filterChange("IMPORTANT"))}
      />
      <label htmlFor="nonimportant">nonimportant</label>
      <input
        type="radio"
        name="filter"
        id="nonimportant"
        checked={currentFilter === "NONIMPORTANT"}
        onChange={() => dispatch(filterChange("NONIMPORTANT"))}
      />
    </div>
  );
};

export default VisibilityFilter;
