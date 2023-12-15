/* eslint-disable @typescript-eslint/no-floating-promises */
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Image from "next/image";

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  // This function will handle the user submitting their email and password
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'verifying' true to display second form and capture the OTP code
      setPendingVerification(true);
    } catch (err: any) {
      // This can return an array of errors.
      // See https://clerk.com/docs/custom-flows/error-handling to learn about error handling
      void console.error(JSON.stringify(err, null, 2));
    }
  };

  // This function will handle the user submitting a code for verification
  const onPressVerify = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }

    try {
      // Submit the code that the user provides to attempt verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status !== "complete") {
        // The status can also be `abandoned` or `missing_requirements`
        // Please see https://clerk.com/docs/references/react/use-sign-up#result-status for  more information
        console.log(JSON.stringify(completeSignUp, null, 2));
      }

      // Check the status to see if it is complete
      // If complete, the user has been created -- set the session active
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        // Redirect the user to a post sign-up route
        void router.push("/");
      }
    } catch (err: any) {
      // This can return an array of errors.
      // See https://clerk.com/docs/custom-flows/error-handling to learn about error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <div className="flex h-screen items-center justify-center  text-white">
      <Image
        src="/car.jpg"
        alt=""
        className="absolute h-screen w-screen object-cover"
        width={1500}
        height={1500}
      />
      {!pendingVerification && (
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
          <div className="flex items-center justify-center pt-6">
            <button
              className="btn w-52 rounded-full bg-purple-950 text-3xl"
              onClick={handleSubmit}
            >
              Sign up
            </button>
            <a className="pl-5" href="/sign-in">
              U hv already an account?
            </a>
          </div>
        </form>
      )}
      {pendingVerification && (
        <div className="z-30 flex ">
          <div>
            <form className="flex w-full flex-col justify-center">
              <input
                value={code}
                placeholder="Code..."
                onChange={(e) => setCode(e.target.value)}
                className="input input-bordered w-full bg-slate-800"
              />
              <button
                onClick={onPressVerify}
                className="btn w-52 rounded-full bg-purple-950 text-3xl"
              >
                Verify Email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
