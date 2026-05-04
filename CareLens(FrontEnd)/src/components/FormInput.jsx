function FormInput({
  type,
  name,
  placeholder,
  value,
  onChange
}) {
  return (
    <input
      className="form-control border-0 border-bottom rounded-0 text-light shadow-none w-100 bg-transparent"
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      style={{ paddingLeft: "30px" }}
    />
  );
}

export default FormInput;

