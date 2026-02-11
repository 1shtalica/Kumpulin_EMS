import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
    title: "Login Kumpulin",
    description: "Masuk ke akun Kumpulin"
}

export default function LoginPage() {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <LoginForm />
        </GoogleOAuthProvider>
    );
}