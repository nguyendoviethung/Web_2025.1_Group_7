import "../style/LoginForm.scss";

export default function LoginForm({
  title,
  formFields,
  forgotPassword,
  registerSection,
  footerContent,
  action,
  onSubmit,
  loading,
  tall = false,  
}) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
      <h2 className="welcome-library">
        Welcome to <span className="name-library">Mindspace Library</span>
      </h2>

      <div className="login-title">{title}</div>

         {formFields}
         {forgotPassword}

      <div className="d-flex justify-content-end w-100 mt-5">

         {registerSection}
         {footerContent}

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
