"use client";
import checkPermission from "@/context/permissionCheck";
import { useParams } from "next/navigation";
import useSWR from "swr";
import React, { useState } from "react";

const fetcher = (url: string) =>
  fetch(url, { method: "GET", credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });

export default function DepartmentPage() {
  const params = useParams<{ departmentId: string }>(); // 為 useParams 添加類型定義，指定其返回的參數結構
  const idDepartment = params?.departmentId;
  const { data, isLoading } = checkPermission();
  const [showEditUSer, setShowEditUser] = useState(false);

  const {
    data: departmentData,
    isLoading: departmentLoading,
    mutate: mutateDepartmentData,
  } = useSWR(
    `http://localhost:3001/department/getDepartment/${idDepartment}?members=true`,
    fetcher,
    {
      revalidateOnFocus: false, // Disable re-fetching when the window is refocused
      revalidateOnReconnect: false, // Disable re-fetching on network reconnect
      shouldRetryOnError: false, // Disable retrying on error
    }
  );

  const {
    data: allDepartmentsData,
    isLoading: allDepartmentsLoading,
    mutate: mutateAllDepartmentsData,
  } = useSWR(`http://localhost:3001/department/getAllDepartments`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const [departmentName, setDepartmentName] = useState("");
  const [departmentLocation, setDepartmentLocation] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  //new-user variables
  const [newUsername, setNewUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserJob, setNewUserJob] = useState("");
  const [newUserExtension, setNewUserExtension] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [userNewDepartment, setUserNewDepartment] = useState("");

  const [adminPassword, setAdminPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<boolean | null>(null);
  const [changePasswordErrorMess, setChangePasswordErrorMess] = useState("");

  //department functions
  const onDepartmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartmentName(e.target.value);
  };

  const onDepartmentLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDepartmentLocation(e.target.value);
  };

  const onDepartmentDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDepartmentDescription(e.target.value);
  };

  //new-user functions
  const onNewUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const onNewUserEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserEmail(e.target.value);
  };

  const onNewUserJobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserJob(e.target.value);
  };

  const onNewUserExtensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserExtension(e.target.value);
  };

  const onNewUserRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewUserRole(e.target.value);
  };

  const onUserDeaprtmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserNewDepartment(e.target.value);
  };

  //password functions
  const onAdminPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  async function submitUpdateDepartment() {
    setSubmitLoading(true);
    if (
      departmentName === "" &&
      departmentLocation === "" &&
      departmentDescription === ""
    ) {
      alert("請輸入部門信息");
      setSubmitLoading(false);
      return;
    }
    let data: any = {
      departmentId: idDepartment,
      name: departmentName,
      location: departmentLocation,
      description: departmentDescription,
    };
    data.name = data.name === "" ? departmentData?.name : data.name;
    data.location =
      data.location === "" ? departmentData?.location : data.location;
    data.description =
      data.description === "" ? departmentData?.description : data.description;

    await fetch(`http://localhost:3001/department/updateDepartment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        departmentId: data.departmentId,
        name: data.name,
        location: data.location,
        description: data.description,
      }),
    }).then((res) => {
      if (res.status === 201) {
        alert("部門信息修改成功");
        mutateDepartmentData();
        setSubmitLoading(false);
      } else {
        alert("部門信息修改失敗");
        setSubmitLoading(false);
      }
    });
  }

  function resetUserForm() {
    setNewUsername("");
    setNewUserEmail("");
    setNewUserJob("");
    setNewUserExtension("");
    setNewUserRole("");
    setUserNewDepartment("");
  }

  async function submitAddUser() {
    setSubmitLoading(true);
    if (
      newUsername === "" ||
      newUserEmail === "" ||
      newUserJob === "" ||
      newUserExtension === "" ||
      newUserRole === ""
    ) {
      alert("請輸入完整信息");
      setSubmitLoading(false);
      return;
    }
    await fetch("http://localhost:3001/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: newUsername,
        departmentId: idDepartment,
        email: newUserEmail,
        job: newUserJob,
        extension: newUserExtension,
        role: newUserRole,
        password: "123",
      }),
    }).then((res) => {
      if (res.status === 201) {
        alert("添加成功");
        resetUserForm();
        mutateDepartmentData();
        mutateAllDepartmentsData();
        setSubmitLoading(false);
        window.location.href = `/userList/${idDepartment}`;
      } else {
        alert("添加失敗");
        setSubmitLoading(false);
      }
    });
  }

  async function submitDeleteDepartment() {
    setSubmitLoading(true);
    mutateDepartmentData();
    if (departmentData?.members.length > 0) {
      alert("部門成員不爲空，無法刪除");
      setSubmitLoading(false);
      return;
    }
    await fetch(`http://localhost:3001/department/deleteDepartment`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        departmentId: idDepartment,
      }),
      credentials: "include",
    }).then((res) => {
      if (res.status === 200) {
        alert("部門刪除成功, 將返回組員清單");
        setSubmitLoading(false);
        window.location.href = "/userList";
      } else {
        alert("部門刪除失敗");
        setSubmitLoading(false);
      }
    });
  }

  async function submitUpdateUser(member: any) {
    if (member.id === data?.id) {
      alert("無法修改自己的信息");
      return;
    }

    if (
      newUsername === "" &&
      newUserEmail === "" &&
      newUserJob === "" &&
      newUserExtension === "" &&
      newUserRole === "" &&
      userNewDepartment === ""
    ) {
      alert("請輸入修改信息");
      return;
    }

    let userForm = {
      userId: member.id,
      username: newUsername,
      email: newUserEmail,
      job: newUserJob,
      extension: newUserExtension,
      role: newUserRole,
      departmentId: userNewDepartment,
    };

    userForm.username =
      userForm.username === "" ? member.username : userForm.username;
    userForm.email = userForm.email === "" ? member.email : userForm.email;
    userForm.job = userForm.job === "" ? member.job : userForm.job;
    userForm.extension =
      userForm.extension === "" ? member.extension : userForm.extension;
    userForm.role = userForm.role === "" ? member.role : userForm.role;
    userForm.departmentId =
      userForm.departmentId === ""
        ? member.departmentId
        : userForm.departmentId;

    setSubmitLoading(true);
    await fetch("http://localhost:3001/user/updateInfo", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId: userForm.userId,
        username: userForm.username,
        email: userForm.email,
        job: userForm.job,
        extension: userForm.extension,
        role: userForm.role,
        departmentId: userForm.departmentId,
      }),
    }).then((res) => {
      if (res.status === 200) {
        alert("修改成功");
        resetUserForm();
        mutateDepartmentData();
        setSubmitLoading(false);
      } else {
        alert("修改失敗");
        setSubmitLoading(false);
      }
    });
  }

  async function submitChangePassword(memberId: string) {
    setPasswordError(null);
    if (memberId === data?.id) {
      alert("無法修改自己的信息");
      return;
    }
    if (newPassword === "" || confirmPassword === "") {
      setChangePasswordErrorMess("請輸入新密碼");
      setPasswordError(true);
      return;
    } else if (newPassword !== confirmPassword) {
      setChangePasswordErrorMess("密碼不一致");
      setPasswordError(true);
      return;
    }
    await fetch("http://localhost:3001/user/updatePassword", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId: memberId,
        oldPassword: adminPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      }),
    }).then((res) => {
      if (res.status === 200) {
        alert("修改成功");
        resetUserForm();
        setSubmitLoading(false);
      } else {
        alert("修改失敗, 請檢查密碼是否正確");
        setSubmitLoading(false);
      }
    });
  }

  async function submitDeleteUser(memberId: string) {
    setSubmitLoading(true);
    await fetch(`http://localhost:3001/user/deleteUser`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: memberId,
      }),
      credentials: "include",
    }).then((res) => {
      if (res.status === 200) {
        alert("刪除成功");
        mutateDepartmentData();
        setSubmitLoading(false);
        return;
      } else {
        alert("刪除失敗");
        setSubmitLoading(false);
        return;
      }
    });
  }

  if (departmentLoading || isLoading || allDepartmentsLoading)
    return <div></div>;

  return (
    <div className="mx-36 my-12">
      <div className="flex flex-col mx-8 mt-4 mb-2 bg-white border shadow-sm rounded-xl">
        <div className="flex justify-start items-center border-b rounded-t-xl py-3 px-4 gap-2 md:px-5">
          <h3 className="text-3xl font-bold text-gray-800">
            {departmentData?.name}
          </h3>
          <p className="text-base">
            共 {departmentData?.members.length} 位成員
          </p>
        </div>
        <div className="py-2 md:px-5 text-lg">
          <p className="mt-2 text-black">地點：{departmentData?.location}</p>
        </div>

        <div className="py-2 md:px-5 text-lg">
          <p className="mt-2 text-black">描述：{departmentData?.description}</p>
        </div>
      </div>

      <div className="mx-8 mt-6">
        <div
          className={`mb-4 inline-flex gap-x-4 ${
            data?.role === "Admin" ? `` : `hidden`
          } `}
        >
          <button
            type="button"
            className="py-3 px-8 inline-flex items-center gap-x-2 -mt-px -ms-px rounded-full  text-sm font-medium focus:z-10 border border-gray-200 bg-blue-600 text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none "
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="hs-modal-update-department"
            data-hs-overlay="#hs-modal-update-department"
          >
            修改部門信息
          </button>
          <div
            id="hs-modal-update-department"
            className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
            role="dialog"
            tabIndex={-1}
            aria-labelledby="hs-modal-update-department-label"
          >
            <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 sm:p-7">
                  <div className="text-center">
                    <h3
                      id="hs-modal-add-department-label"
                      className="block text-2xl font-bold text-gray-800 "
                    >
                      修改部門信息
                    </h3>
                  </div>

                  <div className="mt-5">
                    <div className="grid gap-y-4">
                      <div>
                        <label
                          htmlFor="department-name"
                          className="block text-sm mb-2"
                        >
                          部門名稱
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="department-name"
                            name="department-name"
                            className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
                            onChange={(e) => onDepartmentNameChange(e)}
                            value={departmentName}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="department-location"
                          className="block text-sm mb-2"
                        >
                          部門位置
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="department-location"
                            name="department-location"
                            className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                            onChange={(e) => onDepartmentLocationChange(e)}
                            value={departmentLocation}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="department-description"
                          className="block text-sm mb-2"
                        >
                          部門描述
                        </label>
                        <div className="relative">
                          <textarea
                            id="department-description"
                            name="department-description"
                            className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                            onChange={(e) => onDepartmentDescriptionChange(e)}
                            value={departmentDescription}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-red-600 text-white hover:bg-red-800 focus:outline-none focus:bg-red-800 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-modal-update-department"
                        onClick={() => {
                          setDepartmentName("");
                          setDepartmentLocation("");
                          setDepartmentDescription("");
                        }}
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        disabled={submitLoading}
                        className={
                          " w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                        }
                        onClick={() => {
                          submitUpdateDepartment();
                        }}
                      >
                        確認修改
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add member button */}
          <button
            className="py-3 px-8 inline-flex items-center gap-x-2 -mt-px -ms-px rounded-full  text-sm font-medium focus:z-10 border border-gray-200 bg-blue-600 text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none "
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="hs-modal-add-member"
            data-hs-overlay="#hs-modal-add-member"
          >
            添加成員
          </button>

          <div
            id="hs-modal-add-member"
            className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
            role="dialog"
            tabIndex={-1}
            aria-labelledby="hs-modal-add-member-label"
          >
            <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 sm:p-7">
                  <div className="text-center">
                    <h3
                      id="hs-modal-add-department-label"
                      className="block text-2xl font-bold text-gray-800 "
                    >
                      添加成員
                    </h3>
                  </div>

                  <div className="mt-5">
                    <div>
                      <div className="grid gap-y-4">
                        <div>
                          <label
                            htmlFor="new-username"
                            className="block text-sm mb-2"
                          >
                            使用者名稱
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="new-username"
                              name="new-username"
                              className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
                              onChange={(e) => onNewUsernameChange(e)}
                              value={newUsername}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="new-user-role"
                            className="block text-sm mb-2"
                          >
                            角色
                          </label>
                          <div className="relative">
                            <div className="relative">
                              <select
                                data-hs-select='{
                                  "placeholder": "選擇...",
                                  "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
                                  "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                  "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto",
                                  "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100",
                                  "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600  \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>"
                                }'
                                id="new-user-role"
                                name="new-user-role"
                                onChange={(e) => onNewUserRoleChange(e)}
                              >
                                <option value="">選擇</option>
                                <option value="Admin">管理者</option>
                                <option value="Teacher">教師</option>
                              </select>

                              <div className="absolute top-1/2 end-2.5 -translate-y-1/2">
                                <svg
                                  className="shrink-0 size-4 text-gray-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m7 15 5 5 5-5"></path>
                                  <path d="m7 9 5-5 5 5"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="new-user-email"
                            className="block text-sm mb-2"
                          >
                            使用者郵箱
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="new-user-email"
                              name="new-user-email"
                              className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                              onChange={(e) => onNewUserEmailChange(e)}
                              value={newUserEmail}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="new-user-job"
                            className="block text-sm mb-2"
                          >
                            職位
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="new-user-job"
                              name="new-user-job"
                              className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                              onChange={(e) => onNewUserJobChange(e)}
                              value={newUserJob}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="new-user-extension"
                            className="block text-sm mb-2"
                          >
                            分機
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="new-user-extension"
                              name="new-user-extension"
                              className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                              onChange={(e) => onNewUserExtensionChange(e)}
                              value={newUserExtension}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-red-600 text-white hover:bg-red-800 focus:outline-none focus:bg-red-800 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-modal-add-member"
                        onClick={() => {
                          resetUserForm();
                        }}
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        disabled={submitLoading}
                        className={
                          " w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                        }
                        onClick={() => {
                          submitAddUser();
                        }}
                      >
                        確認添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="py-3 px-8 inline-flex items-center gap-x-2 -mt-px -ms-px rounded-full  text-sm font-medium focus:z-10 border border-gray-200 bg-blue-600 text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none "
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="hs-modal-delete-department"
            data-hs-overlay="#hs-modal-delete-department"
          >
            刪除部門
          </button>

          <div
            id="hs-modal-delete-department"
            className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
            role="dialog"
            tabIndex={-1}
            aria-labelledby="hs-modal-delete-department-label"
          >
            <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all md:max-w-xl md:w-full m-3 md:mx-auto">
              <div className="relative flex flex-col bg-white border shadow-sm rounded-xl overflow-hidden">
                <div className="absolute top-2 end-2">
                  <button
                    type="button"
                    className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Close"
                    data-hs-overlay="#hs-modal-delete-department"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 sm:p-10 overflow-y-auto">
                  <div className="flex gap-x-4 md:gap-x-7">
                    <span className="shrink-0 inline-flex justify-center items-center size-[46px] sm:w-[62px] sm:h-[62px] rounded-full border-4 border-red-50 bg-red-100 text-red-500">
                      <svg
                        className="shrink-0 size-5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                    </span>

                    <div className="grow">
                      <h3
                        id="hs-modal-delete-department-label"
                        className="mb-2 text-xl font-bold text-gray-800"
                      >
                        刪除部門
                      </h3>
                      <p className="text-gray-500">
                        若需要刪除部門，請確認部門成員爲空
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-x-2 py-3 px-4 bg-gray-50 border-t">
                  <button
                    type="button"
                    className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50"
                    data-hs-overlay="#hs-modal-delete-department"
                  >
                    取消
                  </button>
                  <button
                    className="py-2 px-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
                    onClick={() => {
                      submitDeleteDepartment();
                    }}
                  >
                    刪除部門
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            className="py-3 px-8 inline-flex items-center gap-x-2 -mt-px -ms-px rounded-full  text-sm font-medium focus:z-10 border border-gray-200 bg-blue-600 text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none "
            onClick={() => {
              setShowEditUser(!showEditUSer);
            }}
          >
            {showEditUSer ? "關閉編輯" : "編輯成員"}
          </button>
        </div>

        <h2 className="text-2xl font-bold">部門成員:</h2>
      </div>

      {/* -------------------------------------------- */}
      {/* Department members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-8">
        {departmentData?.members?.map(
          (member: {
            departmentId: string;
            id: string;
            username: string;
            job: string;
            extension: string;
            email: string;
            role: string;
          }) => (
            <div
              key={member.username}
              className="flex flex-col rounded-xl p-4 md:p-6 bg-white border-2 border-gray-200"
            >
              <div className="flex items-center gap-x-4">
                <div className="grow">
                  <h3 className="font-medium text-2xl text-gray-800">
                    {member.username}
                  </h3>
                  <p className="text-base uppercase text-gray-500">
                    {member.job}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-lg text-gray-500">
                郵件: {member.email}
                <br />
                分機: {member.extension}
              </p>

              <div
                className={`mt-4 gap-x-2 flex flex-col sm:inline-flex sm:flex-row rounded-lg shadow-sm ${
                  showEditUSer ? `` : `hidden`
                }`}
              >
                <button
                  type="button"
                  className={`${
                    showEditUSer ? `` : `hidden`
                  } py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none `}
                  aria-haspopup="dialog"
                  aria-expanded="false"
                  aria-controls={`hs-modal-update-member-${member.id}`}
                  data-hs-overlay={`#hs-modal-update-member-${member.id}`}
                >
                  修改個人信息
                </button>
                <div
                  id={`hs-modal-update-member-${member.id}`}
                  className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
                  role="dialog"
                  tabIndex={-1}
                  aria-labelledby={`hs-modal-update-member-${member.id}-label`}
                >
                  <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="p-4 sm:p-7">
                        <div className="text-center">
                          <h3
                            id={`hs-modal-update-member-${member.id}-label`}
                            className="block text-2xl font-bold text-gray-800 "
                          >
                            修改信息
                          </h3>
                        </div>

                        <div className="mt-5">
                          <div>
                            <div className="grid gap-y-4">
                              <div>
                                <label
                                  htmlFor={`update-user-role-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  部門
                                </label>
                                <div className="relative">
                                  <div className="relative">
                                    <select
                                      data-hs-select='{
                                  "placeholder": "選擇...",
                                  "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
                                  "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                  "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto",
                                  "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100",
                                  "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600  \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>"
                                }'
                                      id={`update-user-department-${member.id}`}
                                      name={`update-user-department-${member.id}`}
                                      onChange={(e) =>
                                        onUserDeaprtmentChange(e)
                                      }
                                      defaultValue={member.departmentId}
                                    >
                                      <option value="">選擇</option>
                                      {allDepartmentsData?.map(
                                        (department: {
                                          id: string;
                                          name: string;
                                        }) => (
                                          <option
                                            key={department.id}
                                            value={department.id}
                                          >
                                            {department.name}
                                          </option>
                                        )
                                      )}
                                    </select>

                                    <div className="absolute top-1/2 end-2.5 -translate-y-1/2">
                                      <svg
                                        className="shrink-0 size-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="m7 15 5 5 5-5"></path>
                                        <path d="m7 9 5-5 5 5"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`update-username-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  使用者名稱
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`update-username-${member.id}`}
                                    name={`update-username-${member.id}`}
                                    className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none"
                                    onChange={(e) => onNewUsernameChange(e)}
                                    placeholder={member.username}
                                    value={newUsername}
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`update-user-role-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  角色
                                </label>
                                <div className="relative">
                                  <div className="relative">
                                    <select
                                      data-hs-select='{
                                  "placeholder": "選擇...",
                                  "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
                                  "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                                  "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto",
                                  "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100",
                                  "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600  \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>"
                                }'
                                      id={`update-user-role-${member.id}`}
                                      name={`update-user-role-${member.id}`}
                                      onChange={(e) => onNewUserRoleChange(e)}
                                      defaultValue={member.role}
                                    >
                                      <option value="">選擇</option>
                                      <option value="Admin">管理者</option>
                                      <option value="Teacher">教師</option>
                                    </select>

                                    <div className="absolute top-1/2 end-2.5 -translate-y-1/2">
                                      <svg
                                        className="shrink-0 size-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="m7 15 5 5 5-5"></path>
                                        <path d="m7 9 5-5 5 5"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor={`change-user-email-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  使用者郵箱
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`change-user-email-${member.id}`}
                                    name={`change-user-email-${member.id}`}
                                    className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                    onChange={(e) => onNewUserEmailChange(e)}
                                    value={newUserEmail}
                                    placeholder={member.email}
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor={`new-user-job-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  職位
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`new-user-job-${member.id}`}
                                    name={`new-user-job-${member.id}`}
                                    className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                                    onChange={(e) => onNewUserJobChange(e)}
                                    value={newUserJob}
                                    placeholder={member.job}
                                    required
                                  />
                                  <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                                    <svg
                                      className="size-5 text-red-500"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      viewBox="0 0 16 16"
                                      aria-hidden="true"
                                    >
                                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor={`change-user-extension-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  分機
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    id={`change-user-extension-${member.id}`}
                                    name={`change-user-extension-${member.id}`}
                                    className="border py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none "
                                    onChange={(e) =>
                                      onNewUserExtensionChange(e)
                                    }
                                    value={newUserExtension}
                                    placeholder={member.extension}
                                    required
                                  />
                                  <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                                    <svg
                                      className="size-5 text-red-500"
                                      width="16"
                                      height="16"
                                      fill="currentColor"
                                      viewBox="0 0 16 16"
                                      aria-hidden="true"
                                    >
                                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 pt-4">
                            <button
                              type="button"
                              className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-red-600 text-white hover:bg-red-800 focus:outline-none focus:bg-red-800 disabled:opacity-50 disabled:pointer-events-none"
                              data-hs-overlay={`#hs-modal-update-member-${member.id}`}
                              onClick={() => {
                                resetUserForm();
                              }}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              disabled={submitLoading}
                              className={
                                " w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                              }
                              onClick={() => {
                                submitUpdateUser(member);
                              }}
                            >
                              確認修改
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${
                    showEditUSer ? `` : `hidden`
                  } py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none`}
                  aria-haspopup="dialog"
                  aria-expanded="false"
                  aria-controls={`hs-modal-change-password-${member.id}`}
                  data-hs-overlay={`#hs-modal-change-password-${member.id}`}
                >
                  修改密碼
                </button>

                <div
                  id={`hs-modal-change-password-${member.id}`}
                  className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
                  role="dialog"
                  tabIndex={-1}
                  aria-labelledby={`hs-modal-change-password-${member.id}-label`}
                >
                  <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="p-4 sm:p-7">
                        <div className="mt-5">
                          <form>
                            <div className="grid gap-y-4">
                              <div>
                                <label
                                  htmlFor={`admin-password-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  管理者密碼
                                </label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    id={`admin-password-${member.id}`}
                                    name={`admin-password-${member.id}`}
                                    className="py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                    required
                                    onChange={(e) => onAdminPasswordChange(e)}
                                    value={adminPassword}
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor={`password-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  新密碼
                                </label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    id={`password-${member.id}`}
                                    name={`password-${member.id}`}
                                    className="py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                    required
                                    onChange={(e) => onPasswordChange(e)}
                                    value={newPassword}
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor={`confirm-password-${member.id}`}
                                  className="block text-sm mb-2"
                                >
                                  確認密碼
                                </label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    id={`confirm-password-${member.id}`}
                                    name={`confirm-password-${member.id}`}
                                    className="py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                    required
                                    onChange={(e) => onConfirmPasswordChange(e)}
                                    value={confirmPassword}
                                  />
                                </div>
                              </div>

                              {passwordError && (
                                <p className=" text-xs text-red-600 mt-2">
                                  {changePasswordErrorMess}
                                </p>
                              )}

                              {passwordError === false && (
                                <p className=" text-xs text-green-600 mt-2">
                                  修改成功
                                </p>
                              )}

                              <button
                                type="button"
                                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                                onClick={() => {
                                  submitChangePassword(member.id);
                                }}
                              >
                                Sign up
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${
                    showEditUSer ? `` : `hidden`
                  } py-3 px-4 inline-flex items-s gap-x-2 -mt-px -ms-px text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none`}
                  aria-haspopup="dialog"
                  aria-expanded="false"
                  aria-controls={`hs-modal-delete-user-${member.id}`}
                  data-hs-overlay={`#hs-modal-delete-user-${member.id}`}
                >
                  刪除
                </button>

                <div
                  id={`hs-modal-delete-user-${member.id}`}
                  className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
                  role="dialog"
                  tabIndex={-1}
                  aria-labelledby={`hs-modal-delete-user-${member.id}-label`}
                >
                  <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all md:max-w-xl md:w-full m-3 md:mx-auto">
                    <div className="relative flex flex-col bg-white border shadow-sm rounded-xl overflow-hidden">
                      <div className="absolute top-2 end-2">
                        <button
                          type="button"
                          className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                          aria-label="Close"
                          data-hs-overlay={`#hs-modal-delete-user-${member.id}`}
                        >
                          <span className="sr-only">Close</span>
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-4 sm:p-10 overflow-y-auto">
                        <div className="flex gap-x-4 md:gap-x-7">
                          <span className="shrink-0 inline-flex justify-center items-center size-[46px] sm:w-[62px] sm:h-[62px] rounded-full border-4 border-red-50 bg-red-100 text-red-500">
                            <svg
                              className="shrink-0 size-5"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                            </svg>
                          </span>

                          <div className="grow">
                            <h3
                              id={`hs-modal-delete-user-${member.id}-label`}
                              className="mb-2 text-xl font-bold text-gray-800"
                            >
                              刪除成員
                            </h3>
                            <p className="text-gray-500">
                              請確認是否刪除成員{member.username}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end items-center gap-x-2 py-3 px-4 bg-gray-50 border-t">
                        <button
                          type="button"
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50"
                          data-hs-overlay={`#hs-modal-delete-user-${member.id}`}
                        >
                          取消
                        </button>
                        <button
                          className="py-2 px-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none"
                          data-hs-overlay={`#hs-modal-delete-user-${member.id}`}
                          onClick={() => {
                            submitDeleteUser(member.id);
                          }}
                        >
                          刪除成員
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
