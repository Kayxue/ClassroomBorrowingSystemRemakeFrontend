"use client";
import { useEffect, useState } from "react";
import { usePermission } from "@/context/permissionContext";
import { GoBackLogin } from "@/components/GoBackLogin";

export default function userProfile() {
  const { permission, error, isLoading ,checkPermission} = usePermission();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  //checkPermission();
  useEffect(() => {
    //get user information from localstorage
    console.log("run run user");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
  });

  if(isLoading){
    return <div></div>;
  }

  //show user all information from localstorage
  return (
    <div>
          {permission ? (
            <div className="bg-white w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-[#161931]">
              <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block">
                <div className="sticky flex flex-col gap-2 p-4 text-sm border-r border-indigo-100 top-12">
                  <h2 className="pl-3 mb-4 text-2xl font-semibold">設定</h2>

                  <a
                    href="#"
                    className="flex items-center px-3 py-2.5 font-bold bg-white  text-indigo-900 border rounded-full"
                  >
                    個人資料
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
                  >
                    更改密碼
                  </a>
                </div>
              </aside>
              <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
                <div className="p-2 md:p-4">
                  <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
                    <div className="grid max-w-2xl mx-auto mt-8">


                      <div className="items-center mt-8 sm:mt-14 text-[#202142]">
                        <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                          <div className="w-full">
                            <label
                              htmlFor="first_name"
                              className="block mb-2 text-sm font-medium text-indigo-900"
                            >
                              使用者名稱
                            </label>
                            <input
                              type="text"
                              id="first_name"
                              className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                              placeholder="請輸入您的名字"
                              value={username}
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-2 sm:mb-6">
                          <label
                            htmlFor="email"
                            className="block mb-2 text-sm font-medium text-indigo-900"
                          >
                            電子郵件
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                            placeholder={email}
                            required
                          />
                        </div>

                        <div className="mb-2 sm:mb-6">
                          <label
                            htmlFor="profession"
                            className="block mb-2 text-sm font-medium text-indigo-900"
                          >
                            使用者職業
                          </label>
                          <input
                            type="text"
                            id="profession"
                            className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                            placeholder={role}
                            required
                          />
                        </div>

                        <div className="mb-6">
                          <label
                            htmlFor="message"
                            className="block mb-2 text-sm font-medium text-indigo-900"
                          >
                            Bio
                          </label>
                          <textarea
                            id="message"
                            className="block p-2.5 w-full text-sm text-indigo-900 bg-indigo-50 rounded-lg border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 "
                            placeholder="Write your bio here..."
                          ></textarea>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="text-white bg-indigo-700  hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          ) : (
            <GoBackLogin />
          )}
    </div>
  );
}
