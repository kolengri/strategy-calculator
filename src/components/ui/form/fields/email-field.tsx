import { TextField, type TextFieldProps } from "./text-field";

export const EmailField = (props: Omit<TextFieldProps, "type">) => {
  return (
    <TextField {...props} type="email" placeholder={props.placeholder ?? "@"} />
  );
};

export default EmailField;
