import { auth } from "../lib/auth";

async function main() {
  await auth.api.signUpEmail({
    body: {
      name: "STTF Admin",
      email: "admin@sttf.com",
      password: "ChangeThisPassword123!",
    },
  });

  console.log("Admin user created.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});