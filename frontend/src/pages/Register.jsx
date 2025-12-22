import { InputField } from "../components/InputField";
import LoginBackground from "../components/LoginBackground";
import LoginForm from "../components/LoginForm";
import '../style/Register.scss';
import { Link } from "react-router-dom";

export default function Register() {
    return (
        <LoginBackground>
           <LoginForm 
              title = "Sign up"
              action = "Sign up"
              children_1={
                <>
                    <InputField 
                        name = "mail"
                        label = "Enter your email address"
                        type = "email"
                        placeholder = "Enter your email"
                        value = ""
                        onChange = {() => {}}
                    />
                <div className="d-flex gap-4">
                    <InputField
                        name = "username"
                        label = "Enter your username"
                        type = "text"
                        placeholder = "Enter your username"
                        value = ""
                        onChange = {() => {}}
                    />
                    <InputField
                        name = "Contact number"
                        label = "Contact Number"
                        type = "text"
                        placeholder = "Contact Number"
                        value = ""
                        onChange = {() => {}}
                    />
                    
                </div>
                    <InputField
                        name="password"
                        label="Enter your password"
                        type="password"
                        placeholder="Enter your password"
                        value=""
                        onChange={() => {}}
                    />

                </>
              }
              children_3={
                <div className="link-text d-flex flex-column align-items-start">
                  Have an Account ?
                    <Link to="/" className = "register">
                        <div className >
                            Sign in
                        </div>
                     </Link>
                </div>
              }
           />
        </LoginBackground >
    );
}