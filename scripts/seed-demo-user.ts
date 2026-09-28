import "dotenv/config";
import { auth } from "../src/lib/auth";

const email = "demo@busgo.app";
const password = "BusgoDemo123!";

const result = await auth.api.signUpEmail({
  body: {
    name: "Demo Rider",
    email,
    password,
  },
});

console.log(`Seeded ${result.user.email}`);
