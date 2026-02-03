import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
    title: "Register Kumpulin",
    description: "Daftar akun Kumpulin"
}

export default function RegisterPage() {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <RegisterForm />
        </GoogleOAuthProvider>

    );
}