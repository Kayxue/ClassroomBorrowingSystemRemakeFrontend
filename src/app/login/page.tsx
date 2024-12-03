"use client";
import { ChangeEvent, useState } from "react";
import Link from "next/link";
import checkPermission from "@/context/permissionCheck";

export default function login() {
  const { isLoading, isEmpty } = checkPermission();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordIncorrect, setPasswordIncorrect] = useState(false);

  function onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  async function login() {
    setSubmitLoading(true);
    setPasswordIncorrect(false);
    const result = await fetch("http://localhost:3001/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 201) {
          return 1;
        } else if (res.status === 401 || res.status === 500) {
          setPasswordIncorrect(true);
          return -1;
        }
      })
      .catch((e) => {
        console.log(e);
        setPasswordIncorrect(true);
        return -1;
      });
    if (result === 1) {
      window.location.href = "/user";
    }
    setSubmitLoading(false);
  }

  if (isLoading) {
    return <div></div>;
  }

  if (!isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              You have already logged in
            </h1>
            <Link href="/user">
              <button className="w-full text-white bg-[#2563eb] hover:bg-[#1d4ed8] focus:ring-4 focus:outline-none focus:ring-[#93c5fd] font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-6">
                Go to user page
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>

            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  htmlFor="user_name"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your username
                </label>
                <input
                  type="text"
                  name="user_name"
                  id="user_name"
                  onChange={(e) => onUsernameChange(e)}
                  value={username}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="username"
                  required
                ></input>
              </div>

              <div>
                <label
                  htmlFor="user_password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="user_password"
                  id="user_password"
                  placeholder="••••••••"
                  onChange={(e) => onPasswordChange(e)}
                  value={password}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                ></input>
              </div>

              {passwordIncorrect && (
                <p className="text-red-500 text-sm">Password is incorrect</p>
              )}

              {submitLoading ? (
                <button
                  type="submit"
                  className="w-full text-white bg-[#2563eb] hover:bg-[#1d4ed8] focus:ring-4 focus:outline-none focus:ring-[#93c5fd] font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  disabled
                >
                  Loading...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full text-white bg-[#2563eb] hover:bg-[#1d4ed8] focus:ring-4 focus:outline-none focus:ring-[#93c5fd] font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={() => login()}
                >
                  Sign in
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}