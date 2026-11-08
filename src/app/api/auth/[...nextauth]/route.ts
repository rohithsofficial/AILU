// next-auth's sign-in and sign-out endpoints. The setup is in src/auth.ts.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
