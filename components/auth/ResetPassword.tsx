// "use client";

// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { FaArrowLeft } from "react-icons/fa";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
// import { useSearchParams } from "next/navigation";
// import { resetPassword } from "@/lib/auth-client";

// // ✅ Skema validasi Zod
// const resetPasswordSchema = z
//   .object({
//     password: z.string().min(6, "Password must be at least 6 characters"),
//     confirmPassword: z
//       .string()
//       .min(6, "Confirm Password must be at least 6 characters"),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     path: ["confirmPassword"],
//     message: "Passwords do not match",
//   });

// type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// export default function ResetPasswordForm() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState<string>();
//   const [error, setError] = useState<string>();
//   const searchParams = useSearchParams();

//   const token = searchParams.get("token") ?? undefined;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ResetPasswordFormValues>({
//     resolver: zodResolver(resetPasswordSchema),
//   });

//   const onSubmit = async (data: ResetPasswordFormValues) => {
//     try {
//       const result = await resetPassword({
//         newPassword: data.password,
//         token: token,
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
//     <div className="flex justify-center items-center min-h-screen bg-gray-50 px-5">
//       <Card className="w-full max-w-lg shadow-md">
//         <CardHeader>
//           <CardTitle className="text-center text-lg md:text-xl font-semibold">
//             <div className="relative flex items-center justify-start">
//               <FaArrowLeft
//                 onClick={() => router.back()}
//                 className="cursor-pointer"
//               />
//               <div className="absolute left-1/2 -translate-x-1/2 text-center">
//                 Reset Your Password
//               </div>
//             </div>
//             <p className="text-sm md:text-base mt-5 text-center text-gray-500">
//               Enter your new password below.
//             </p>
//           </CardTitle>
//           <div className="mx-auto">
//             {error && <h1 className="text-red-500">{error}</h1>}
//           </div>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Password */}
//             <div className="space-y-2">
//               <Label htmlFor="password">New Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter new password"
//                 {...register("password")}
//                 className={cn(
//                   errors.password &&
//                     "border-red-500 focus-visible:ring-red-500",
//                 )}
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-sm">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="Confirm new password"
//                 {...register("confirmPassword")}
//                 className={cn(
//                   errors.confirmPassword &&
//                     "border-red-500 focus-visible:ring-red-500",
//                 )}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-sm">
//                   {errors.confirmPassword.message}
//                 </p>
//               )}
//             </div>

//             {/* Success Message */}
//             {success && (
//               <p className="text-sm md:text-base text-green-700">{success}</p>
//             )}

//             {/* Submit Button */}
//             <Button type="submit" className="w-full mt-2" disabled={loading}>
//               {loading ? "Resetting..." : "Reset Password"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
