"use client";
import React, { useEffect, useState } from "react";
import checkPermission from "@/context/permissionCheck";
import Link from "next/link";

const JobCards = () => {
  interface Department {
    id: string;
    name: string;
    userCount: number;
  }

  interface DepartmentData{
    count:number,
    departmentWithUserCount:Department[]
  }

  const { data, isLoading } = checkPermission();
  const [departments, setDepartments] = useState<DepartmentData>({} as any);
  //const [serverError, setServerError] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentLocation, setDepartmentLocation] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

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

  async function submitDepartment() {
    if(departmentName === "" || departmentLocation === "" || departmentDescription === "") {
      alert("請填寫完整資料");
      return;
    }
    setSubmitLoading(true);
    await fetch("http://localhost:3001/department/addDepartment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: departmentName,
        location: departmentLocation,
        description: departmentDescription,
      }),
      credentials: "include",
    });
    setSubmitLoading(false);
    //refetch the data
    fetchJobs();

    //clear the input
    setDepartmentName("");
    setDepartmentLocation("");
    setDepartmentDescription("");
  }
  const fetchJobs = async () => {
    //setServerError(false);
    const response = await fetch(
      "http://localhost:3001/department/getAllDepartments",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    ).then((res) => {
      if (res.status === 401 || res.status === 500) {
        //setServerError(true);
        return [{ id: "", name: "", userCount: 0 }];
      } else if (res.status === 200) {
        return res.json();
      }
    });
    const departmentData = await response;
    setDepartments(departmentData);
  };

  useEffect(() => {

    fetchJobs();
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 className="text-2xl font-bold md:text-5xl md:leading-tight">
          部門
        </h2>
        <p className="mt-1 text-gray-600 ">此學校總共有 {departments.count} 個部門</p>
      </div>
      {/* //check data is empty or not first and then check whether it is admin */}
      {data?.role === "Admin" && (
        <div className="mb-4 flex flex-col sm:inline-flex sm:flex-row rounded-full gap-4">
          <button
            type="button"
            className="py-3 px-8 inline-flex items-center gap-x-2 -mt-px -ms-px rounded-full  text-sm font-medium focus:z-10 border border-gray-200 bg-blue-600 text-white shadow-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none "
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="hs-modal-signup"
            data-hs-overlay="#hs-modal-add-department"
          >
            添加部門
          </button>
          <div
            id="hs-modal-add-department"
            className="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto"
            role="dialog"
            tabIndex={-1}
            aria-labelledby="hs-modal-add-department-label"
          >
            <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 sm:p-7">
                  <div className="text-center">
                    <h3
                      id="hs-modal-add-department-label"
                      className="block text-2xl font-bold text-gray-800 "
                    >
                      添加部門
                    </h3>
                  </div>

                  <div className="mt-5">
                    <div>
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
                          <p
                            className="hidden text-xs text-red-600 mt-2"
                            id="email-error"
                          ></p>
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
                          <p
                            className="hidden text-xs text-red-600 mt-2"
                            id="department-location-error"
                          ></p>
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
                          <p
                            className="hidden text-xs text-red-600 mt-2"
                            id="department-description-error"
                          ></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-red-600 text-white hover:bg-red-800 focus:outline-none focus:bg-red-800 disabled:opacity-50 disabled:pointer-events-none"
                        data-hs-overlay="#hs-modal-add-department"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        disabled={submitLoading}
                        className={
                          " w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-2xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                        }
                        onClick={() => submitDepartment()}
                      >
                        添加部門
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {departments?.departmentWithUserCount?.map((department) => (
          <Link
            key={department.id}
            className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md focus:outline-none focus:shadow-md transition"
            href={`/userList/${department.id}`}
          >
            <div className="p-4 md:p-10">
              <div className="flex justify-between items-center gap-x-3">
                <div className="grow">
                  <h3 className="text-lg group-hover:text-blue-600 font-semibold text-gray-800">
                    {department.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {department.userCount} job positions
                  </p>
                </div>
                <div>
                  <svg
                    className="shrink-0 size-5 text-gray-800"
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
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JobCards;
