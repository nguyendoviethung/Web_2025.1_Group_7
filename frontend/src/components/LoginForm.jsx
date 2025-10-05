
import {Form} from "./Form";
import "../style/LoginForm.scss";

export default function LoginForm({title, childrenSignInInput,childrenSignInForgot,childrenSignInNotAccount,action}) {
    return (
        <div className="login-form">
            <h2 className="welcome-library">
                Welcome to 
                <span className="name-library">
                    Mindspace Library
                </span>
            </h2>
            <div className="login-title"> {title} </div>

             {childrenSignInInput} 
            
            <Form 
                name="password"
                label="Enter your password"
                type="password"
                placeholder="Enter your password"
                value=""
                onChange={() => {}}
            />
              {childrenSignInForgot}
                <div className = "d-flex justify-content-end w-100 mt-5">
                    {childrenSignInNotAccount}
                <button className="login-button">
                    {action}
                </button>
            </div>
        </div>
    );
}