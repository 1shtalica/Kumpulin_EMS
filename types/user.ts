export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profile_url?: string;
  phone_number?: string;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
}
