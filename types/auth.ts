export type RegisterPayload = {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
}

export type RegisterOrganizerPayload = RegisterPayload & {
    name: string;
    slug: string;
}