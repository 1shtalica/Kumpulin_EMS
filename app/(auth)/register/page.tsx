import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Login Kumpulin",
    description: "Masuk ke akun Kumpulin kamu"
}

export default function RegisterPage (){
    return (
        <div>
            <RegisterForm/>
        </div>
    );
}