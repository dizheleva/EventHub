import { useState } from "react";

/**
 * useForm - Custom hook for form state management
 * 
 * Simplifies form handling by managing form values and providing
 * a register function for input fields.
 * 
 * @param {function} callback - Function to call on form submission
 * @param {object} initialValues - Initial form values
 * @returns {object} Form utilities (values, setValues, register, changeHandler, formAction)
 */
export function useForm(callback, initialValues = {}) {
  const [values, setValues] = useState(initialValues);

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formAction = (e) => {
    e?.preventDefault();
    callback(values);
  };

  const register = (fieldName, options = {}) => {
    return {
      name: fieldName,
      onChange: changeHandler,
      value: values[fieldName] ?? '',
      ...options
    };
  };

  return {
    values,
    setValues,
    register,
    changeHandler,
    formAction,
  };
}

