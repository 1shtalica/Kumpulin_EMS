// "use client";

import { Divide } from "lucide-react";

// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";

// import { FaArrowLeft } from "react-icons/fa";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { FcGoogle } from "react-icons/fc";
// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import { signIn, useSession, requestPasswordReset } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";

// // 🔹 Skema validasi Zod
// const forgotPasswordSchema = z.object({
//   email: z.string().email("Invalid Email"),
// });

// type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// export default function ForgotPasswordForm() {
//   const router = useRouter();
//   const sesion = useSession();
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState<string>();
//   const [error, setError] = useState<string>();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ForgotPasswordFormValues>({
//     resolver: zodResolver(forgotPasswordSchema),
//   });

//   const onSubmit = async (data: ForgotPasswordFormValues) => {
//     try {
//       const result = await requestPasswordReset({
//         email: data.email,
//         redirectTo: "/reset-password",
//       });
//       console.log(data);
//       if (result.error) {
//         setError(result.error?.message || "something went wrong");
//         console.log(result.error.message);
//       } else {
//         setSuccess(
//           "successfully sent password reset request and you'll be redirect to login",
//         );
//         setTimeout(() => {
//           router.push("/login");
//         }, 1500);
//       }
//     } catch (e) {
//       setError("something went wrong");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-50 px-5 md:mx-0">
//       <Card className="w-full max-w-lg shadow-md">
//         <CardHeader>
//           <CardTitle className="text-center text-x md:text-xl font-semibold">
//             <div>
//               <div className="relative flex items-center justify-start">
//                 <FaArrowLeft onClick={() => router.back()} className="" />

//                 <div className="absolute left-1/2 -translate-x-1/2 text-center">
//                   Forgot Your Password?
//                 </div>
//               </div>
//               <p className="text-sm md:text-base mt-5 text-center text-gray-500">
//                 Enter your e-mail address, and we'll give you reset password
//                 instruction.
//               </p>
//             </div>
//           </CardTitle>

//           <div className="mx-auto">
//             {error && <h1 className="text-red-500">{error}</h1>}
//           </div>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Email */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 {...register("email")}
//                 className={cn(
//                   errors.email && "border-red-500 focus-visible:ring-red-500",
//                 )}
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-sm">{errors.email.message}</p>
//               )}
//             </div>
//             <div className="">
//               {success && (
//                 <p className="text-sm md:text-base text-green-700 text-green-700">
//                   {success}
//                 </p>
//               )}
//             </div>
//             <Button type="submit" className="w-full mt-2" disabled={loading}>
//               {loading ? "sending in..." : "Reset password"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
export default function ForgotPasswordForm() {
    return(
<div className="text-black">
    <h1>Forgot Password</h1>
    <p>Enter your email address, and we'll give you reset password instruction.</p>
</div>
) }