import { Input } from "@/components/ui/input";
import { forwardRef, ComponentProps } from "react";

interface DefaultInputProps extends ComponentProps<typeof Input> {
  defaultFillValue?: string;
  onValueChange?: (value: string) => void;
}

const DefaultInput = forwardRef<HTMLInputElement, DefaultInputProps>(
  ({ defaultFillValue, onValueChange, onBlur, placeholder, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!e.target.value && defaultFillValue) {
        onValueChange?.(defaultFillValue);
      }
      onBlur?.(e);
    };

    return (
      <Input
        ref={ref}
        placeholder={placeholder ?? defaultFillValue}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

DefaultInput.displayName = "DefaultInput";
export default DefaultInput;
