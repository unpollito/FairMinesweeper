import "./HintSection.css";
import { SolverStep } from "./solver/solver_types";
import { getHintText } from "./solver/solver_hint_functions";

export const HintSection = ({
  hint,
  onRequestHint,
}: {
  hint?: SolverStep;
  onRequestHint: () => void;
}): React.ReactElement => {
  return (
    <div className={"hint-section"}>
      <button
        className={`hint-section__button ${
          hint ? "hint-section__button--disabled" : ""
        }`}
        onClick={() => onRequestHint()}
      >
        Get a hint
      </button>
      {hint ? (
        <p className={"hint-section__text"}>{getHintText(hint)}</p>
      ) : undefined}
    </div>
  );
};
