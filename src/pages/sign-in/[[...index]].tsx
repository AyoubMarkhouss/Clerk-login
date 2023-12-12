import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Handle the submission of the sign-in form
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        // If complete, user exists and provided password match -- set session active
        await setActive({ session: result.createdSessionId });
        // Redirect the user to a post sign-in route
        router.push("/");
      } else {
        // The status can also be `needs_factor_on', 'needs_factor_two', or 'needs_identifier'
        // Please see https://clerk.com/docs/references/react/use-sign-in#result-status for  more information
        console.error(JSON.stringify(result, null, 2));
      }
    } catch (err: any) {
      // This can return an array of errors.
      // See https://clerk.com/docs/custom-flows/error-handling to learn about error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Display a form to capture the user's email and password
  return (
    <div className="flex h-screen items-center justify-center  text-white">
      <Image
        src="/car.jpg"
        alt=""
        className="absolute h-screen w-screen object-cover"
        width={1500}
        height={1500}
      />

      <form className="flex w-full max-w-lg flex-col gap-5 rounded-3xl bg-white/30 p-9 backdrop-blur-sm">
        <div className="flex justify-center">
          <Image src="/batman.png" alt="logo" height={200} width={200} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="text-3xl text-blue-950">
            Email
          </label>
          <input
            onChange={(e) => setEmailAddress(e.target.value)}
            id="email"
            name="email"
            type="email"
            className="input input-bordered w-full bg-slate-800"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-3xl text-blue-950">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            className="input input-bordered w-full bg-slate-800"
          />
        </div>
        <div className="flex justify-center pt-6 items-center">
          <button
            className="btn w-52 rounded-full bg-purple-950 text-3xl"
            onClick={handleSubmit}
          >
            Sign in
          </button>
          <a className='pl-5' href="/sign-up">No account yet?</a>
        </div>
      </form>
    </div>
  );
}
