import GetStartedForm from "@/components/auth/GetStartedForm";
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background";


export default async function GetStartedPage() {

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GetStartedForm />
    </div>
  );
}