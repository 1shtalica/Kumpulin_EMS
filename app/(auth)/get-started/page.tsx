import GetStartedForm from "@/components/auth/GetStartedForm";
import { getServerUser } from "@/services/server-auth";


export default async function GetStartedPage() {
  const user = await getServerUser();
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GetStartedForm initialUser={user} />
    </div>
  );
}