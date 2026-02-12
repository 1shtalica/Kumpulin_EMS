import GetStartedForm from "@/components/auth/GetStartedForm";
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background";
import { getServerUser } from "@/services/server-auth";


export default async function GetStartedPage() {
  const user = await getServerUser();
  console.log(user);
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GetStartedForm initialUser={user} />
    </div>
  );
}