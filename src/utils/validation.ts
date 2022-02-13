export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export default function validate(validatable: Validatable) {
  let isValid = true;
  const value = validatable.value;

  if (validatable.required) {
    isValid = isValid && !!value.toString().trim().length;
  }

  if (typeof value === "string") {
    if (validatable.minLength != null) {
      isValid =
        isValid && value.toString().trim().length >= validatable.minLength;
    }

    if (validatable.maxLength != null) {
      isValid =
        isValid && value.toString().trim().length <= validatable.maxLength;
    }
  }

  if (typeof value === "number") {
    if (validatable.min != null) {
      isValid = isValid && value >= validatable.min;
    }

    if (validatable.max != null) {
      isValid = isValid && value <= validatable.max;
    }
  }

  return isValid;
}
