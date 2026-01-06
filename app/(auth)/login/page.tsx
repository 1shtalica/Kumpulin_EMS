import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
    title: "Login Kumpulin",
    description: "Masuk ke akun Kumpulin kamu"
}

export default function LoginPage (){
    return (
        <div>
            <LoginForm/>
        </div>
    );
}