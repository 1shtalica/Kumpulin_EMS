import GetStartedForm from "@/components/auth/GetStartedForm";
import { getServerUser } from "@/services/server-auth";


export default async function GetStartedPage() {
  const user = await getServerUser();
  return <GetStartedForm initialUser={user} />;
}
