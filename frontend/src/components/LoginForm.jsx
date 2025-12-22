import "../style/LoginForm.scss";

export default function LoginForm({
  title,
  children_1,
  children_2,
  children_3,
  action,
  onSubmit,
  loading
}) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h2 className="welcome-library">
        Welcome to <span className="name-library">Mindspace Library</span>
      </h2>

      <div className="login-title">{title}</div>

      {children_1}
      {children_2}

      <div className="d-flex justify-content-end w-100 mt-5">
        {children_3}
        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {action}
        </button>
      </div>
    </form>
  );
}
