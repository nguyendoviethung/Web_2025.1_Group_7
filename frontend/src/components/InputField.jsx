import '../style/InputField.scss';

export function InputField({
  name, label, type, placeholder,
  value, onChange, onKeyDown, inputRef
}) {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}   
        ref={inputRef}          
        className="form-input"
      />
    </div>
  );
}