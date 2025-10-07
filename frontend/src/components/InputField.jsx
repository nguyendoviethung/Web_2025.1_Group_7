import '../style/InputField.scss';

export function InputField({ name, label, type, placeholder, value, onChange }) {
  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input 
        type={type}
        value = {value}
        placeholder={placeholder}
        onChange={onChange}
        className="form-input"
      />
    </div>
  );
}