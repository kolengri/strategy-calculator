import { Button, type ButtonProps } from "../../button";
import { useFormContext } from "../form";

export type SubmitButtonProps = Omit<ButtonProps, "type">;

const SubmitButton = (props: SubmitButtonProps) => {
  const form = useFormContext();
  const { disabled, children, ...rest } = props;

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        isFormValid: state.isFormValid,
        isDirty: state.isDirty,
      })}
    >
      {({ isSubmitting, isFormValid, isDirty }) => (
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid || !isDirty || disabled}
          isLoading={isSubmitting}
          {...rest}
        >
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
};

export default SubmitButton;
