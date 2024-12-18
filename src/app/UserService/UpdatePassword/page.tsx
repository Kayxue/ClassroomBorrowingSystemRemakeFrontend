"use client";
import CheckPermission from "@/context/permissionCheck";
import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { GoBackLogin } from "@/components/GoBackLogin";

export default function UpdatePassword() {
  const { data, isLoading } = CheckPermission();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);

  function onOldPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setOldPassword(e.target.value);
  }

  function onNewPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setNewPassword(e.target.value);
  }

  function onConfirmPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(e.target.value);
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      alert("密碼不相同");
      setNewPasswordError(true);
      return;
    }

    if (newPassword.length < 1) {
      alert("密碼不可為空");
      return;
    }
    setSaveLoading(true);

    const response = await fetch("http://localhost:3001/user/updatePassword", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.id,
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 201) {
          alert("密碼更新成功");
          return;
        } else {
          alert("密碼更新失敗");
        }
      })
      .catch((e) => {
        alert("密碼更新失敗");
      });
    setSaveLoading(false);
  }

  if (isLoading) {
    return <div></div>;
  }
  if (!data) {
    return <GoBackLogin />;
  }
  return (
    <div className="bg-white w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-[#161931]">
      <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block">
        <div className="sticky flex flex-col gap-2 p-4 text-sm border-r border-indigo-100 top-12">
          <h2 className="pl-3 mb-4 text-3xl font-semibold">設定</h2>

          <Link
            href="/UserService/UserInfo"
            className="text-xl flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
          >
            個人資料
          </Link>
          <Link
            href="#"
            className="text-xl flex items-center px-3 py-2.5 font-bold bg-white  text-indigo-900 border rounded-full"
          >
            更改密碼
          </Link>
          <Link
                href="/UserService/UserBorrowHistory"
                className="text-xl flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
              >
                借用紀錄
              </Link>
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
                      htmlFor="old_password"
                      className="block mb-2 text-xl font-medium text-indigo-900"
                    >
                      舊密碼
                    </label>
                    <input
                      type="text"
                      name="old_password"
                      id="old_password"
                      maxLength={10}
                      className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                      onChange={(e) => onOldPasswordChange(e)}
                      value={oldPassword}
                    />
                  </div>
                </div>

                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="new_password"
                    className="text-xl block mb-2 text-sm font-medium text-indigo-900"
                  >
                    新密碼
                  </label>
                  <input
                    type="text"
                    id="new_password"
                    name="new_password"
                    className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                    onChange={(e) => onNewPasswordChange(e)}
                    value={newPassword}
                  />
                </div>

                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="confirm_password"
                    className="block mb-2 text-xl font-medium text-indigo-900"
                  >
                    確認密碼
                  </label>
                  <input
                    type="text"
                    id="confirm_password"
                    name="confirm_password"
                    className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                    onChange={(e) => onConfirmPasswordChange(e)}
                    value={confirmPassword}
                  />
                </div>
                <div className="mb-1 sm:mb-6">
                  {newPasswordError && (
                    <p className="text-red-500 text-sm">密碼不相同</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-m font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                    aria-controls="hs-scale-animation-modal"
                    data-hs-overlay="#hs-scale-animation-modal"
                  >
                    提交
                  </button>

                  <div
                    id="hs-scale-animation-modal"
                    className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
                    role="dialog"
                    tabIndex={-1}
                    aria-labelledby="hs-scale-animation-modal-label"
                  >
                    <div className="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
                      <div className="w-full flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto ">
                        <div className="p-4 overflow-y-auto">
                          <p className="mt-1 text-gray-800">
                            確認是否要更改密碼
                          </p>
                        </div>
                        <div className="flex justify-end items-center gap-x-2 py-3 px-4 border-t">
                          <button
                            type="button"
                            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
                            data-hs-overlay="#hs-scale-animation-modal"
                          >
                            Close
                          </button>
                          {saveLoading ? (
                            <button
                              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
                              disabled
                            >
                              Loading...
                            </button>
                          ) : (
                            <button
                              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                              data-hs-overlay="#hs-scale-animation-modal"
                              onClick={() => changePassword()}
                            >
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
