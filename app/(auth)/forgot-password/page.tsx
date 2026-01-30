import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
// import { checkSession } from "@/lib/checkSession";
import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
// //   const session = await checkSession();
//   if (session) {
//     redirect("/dashboard");
//   }
  return (
    <div className="w-full">
      <ForgotPasswordForm />
    </div>
  );
}
