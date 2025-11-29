import { isEmptyArray } from "is-what";
import { useFieldContext } from "../../form";

export const useError = (): string[] | null => {
  const { state, form } = useFieldContext<unknown>();
  const hasError =
    (state.meta.isBlurred || form.state.isFormValid) &&
    !isEmptyArray(state.meta.errors);

  return hasError ? state.meta.errors.map((e) => e.message) : null;
};
