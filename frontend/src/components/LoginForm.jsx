
import {InputField} from "./InputField";
import "../style/LoginForm.scss";

export default function LoginForm({title, children_1,children_2,children_3,action, onClick}) {
    return (
        <div className="login-form">
            <h2 className="welcome-library">
                Welcome to 
                <span className="name-library">
                    Mindspace Library
                </span>
            </h2>
            <div className="login-title"> {title} </div>

             {children_1} 
            
            <InputField
                name="password"
                label="Enter your password"
                type="password"
                placeholder="Enter your password"
                value=""
                onChange={() => {}}
            />

              {children_2}

            <div className = "d-flex justify-content-end w-100 mt-5">    
              {children_3}
                <button className="login-button" onClick = {onClick}>
                    {action}
                </button>
            </div>
        </div>
    );
}