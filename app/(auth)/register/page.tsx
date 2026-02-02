import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
    title: "Register Kumpulin",
    description: "Daftar akun Kumpulin"
}

export default function RegisterPage (){
    return (
        <div>
            <RegisterForm/>
        </div>
    );
}