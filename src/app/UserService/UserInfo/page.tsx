"use client";
import { ChangeEvent, useState } from "react";
import CheckPermission from "@/context/permissionCheck";
import { GoBackLogin } from "@/components/GoBackLogin";
import Link from "next/link";

interface FormData {
  name: string;
  email: string;
  userId?: string;
}

export default function UserProfile() {
  const { data, isLoading } = CheckPermission();
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userId: "",
  });
  const [errorName, setErrorName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorForm, setErrorForm] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    let isFalse: boolean = false;
    if (formData.name.length < 3 && formData.name !== "") {
      setErrorName("使用者名稱最少要有3個字元");
      setErrorForm(true);
      isFalse = true;
    } else if (
      formData.name !== "" &&
      !formData.name &&
      formData.name.length > 10
    ) {
      setErrorName("使用者名稱最多10個字元");
      setErrorForm(true);
      isFalse = true;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (formData.email !== "" && !emailRegex.test(formData.email)) {
      setErrorEmail("請輸入正確的電子郵件格式");
      setErrorForm(true);
      isFalse = true;
    }

    console.log("errorForm: ", errorForm);
    if (isFalse) {
      return false;
    }
    return true;
  };

  const filterEmptyFields = (data: FormData): Partial<FormData> => {
    const filteredData: Partial<FormData> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== "" && value !== null && value !== undefined) {
        filteredData[key as keyof FormData] = value;
      }
    }
    return filteredData;
  };

  async function saveProfile() {
    setSaveLoading(true);
    setErrorForm(false);
    if (!validateForm()) {
      setSaveLoading(false);
      return;
    }
    if (formData.name === "" && formData.email === "") {
      setSaveLoading(false);
      alert("沒有資料更新");
      return;
    }
    const requestBody = filterEmptyFields({
      ...formData,
      userId: data.id,
    });

    await fetch("http://localhost:3001/user/updateInfo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    }).then((res) => {
      if (res.status === 200) {
        alert("更新成功");
      } else {
        alert("更新失敗");
      }
    });
    setSaveLoading(false);
    window.location.reload();
  }

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div>
      {data ? (
        <div className="bg-white w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-[#161931]">
          <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block">
            <div className="sticky flex flex-col gap-2 p-4 text-sm border-r border-indigo-100 top-12">
              <h2 className="pl-3 mb-4 text-3xl font-semibold">設定</h2>

              <Link
                href="#"
                className="text-xl flex items-center px-3 py-2.5 font-bold bg-white  text-indigo-900 border rounded-full"
              >
                個人資料
              </Link>
              <Link
                href="/UserService/UpdatePassword"
                className="text-xl flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
              >
                更改密碼
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
                          htmlFor="first_name"
                          className="block mb-2 text-xl font-medium text-indigo-900"
                        >
                          使用者名稱
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="first_name"
                          maxLength={10}
                          className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                          placeholder={data.username}
                          onChange={handleChange}
                          value={formData.name}
                        />
                      </div>
                    </div>
                    <div className="mb-1 sm:mb-6">
                      {errorForm && (
                        <p className="text-red-500 text-sm">{errorName}</p>
                      )}
                    </div>

                    <div className="mb-2 sm:mb-6">
                      <label
                        htmlFor="email"
                        className="text-xl block mb-2 text-sm font-medium text-indigo-900"
                      >
                        電子郵件
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                        placeholder={data.email}
                        onChange={handleChange}
                        value={formData.email}
                      />
                    </div>
                    <div className="mb-1 sm:mb-6">
                      {errorForm && (
                        <p className="text-red-500 text-sm">{errorEmail}</p>
                      )}
                    </div>

                    <div className="mb-2 sm:mb-6">
                      <label
                        htmlFor="profession"
                        className="block mb-2 text-xl font-medium text-indigo-900"
                      >
                        網站角色
                      </label>
                      <input
                        type="text"
                        id="profession"
                        className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                        placeholder={data.role}
                        value={data.role}
                        readOnly
                      />
                    </div>
                    <div className="mb-2 sm:mb-6">
                      <label
                        htmlFor="atDepartment"
                        className="block mb-2 text-xl font-medium text-indigo-900"
                      >
                        所在部門
                      </label>
                      <input
                        type="text"
                        id="atDepartment"
                        className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                        placeholder={data.department.name}
                        value={data.department.name}
                        readOnly
                      />
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="extension"
                        className="block mb-2 text-xl font-medium text-indigo-900"
                      >
                        分機
                      </label>
                      <input
                        type="text"
                        id="extension"
                        className="bg-indigo-50 border border-indigo-300 text-indigo-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 "
                        placeholder={data.extension}
                        value={data.extension}
                        readOnly
                      />
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
                        confirm
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
                                確認是否要儲存更改
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
                                  onClick={() => saveProfile()}
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
      ) : (
        <GoBackLogin />
      )}
    </div>
  );
}
