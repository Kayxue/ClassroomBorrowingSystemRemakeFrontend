"use client";
import checkPermission from "@/context/permissionCheck";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());

export default function Borrow() {
  const router = useRouter();
  const { data, isLoading } = checkPermission();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<number | null>(0);
  const [classroomName, setClassroomName] = useState<string>("");
  const [classroomPlace, setClassroomPlace] = useState<string>("");
  const [classroomDescription, setClassroomDescription] = useState<string>("");

  const handleToggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
  } = useSWR("http://localhost:3001/classroom/getClassrooms", fetcher, {
    revalidateOnFocus: false, // Disable re-fetching when the window is refocused
    revalidateOnReconnect: false, // Disable re-fetching on network reconnect
    shouldRetryOnError: false, // Disable retrying on error
  });

  const checkClassroom = (id: string) => {
    if (router) {
      router.push(`/borrow/${id}/`);
    } else {
      console.log("router is null");
    }
  };

  const startAddClassroom = async () => {
    if (isDisabled) return;
    setIsDisabled(true);

    const isInvalidField = (value: string) => !value || /\s/.test(value);

    if (isInvalidField(classroomName) || isInvalidField(classroomPlace) || isInvalidField(classroomDescription)) {
      setMessage("全部欄位都必須填寫且不能有空白");
      setMessageType(0);
      setIsDisabled(false);
      return;
    }

    let classroomData = {
      name: classroomName,
      place: classroomPlace,
      description: classroomDescription,
    };

    try {
      const response = await fetch("http://localhost:3001/classroom/addClassroom", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classroomData),
      });

      const json = await response.json();

      if (json.affectedRows > 0) {
        setMessage("成功新增");
        setMessageType(1);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage("新增失敗");
        setMessageType(0);
        setIsDisabled(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(String(error));
      setMessageType(0);
      setIsDisabled(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {isLoading || swrLoading ? (
        <div></div>
      ) : (
        <>
          {!data ? (
            <div className="mt-16">
              <p className="text-lg md:text-5xl bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-bold">需要登入帳號</p>
            </div>
          ) : (
            <>
              <div className="h-16" />
              <div>
                <p className="text-lg md:text-5xl bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-bold">教室列表</p>
              </div>

              {data.role == "Admin" && (
                <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
                  <button
                    className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-expanded={isModalOpen ? "true" : "false"}
                    onClick={handleToggleModal}
                    disabled={isDisabled}
                  >
                    新增教室
                  </button>
                </div>
              )}

              {isModalOpen && (
                <div
                  id="classroom-add"
                  className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto flex items-center justify-center bg-black bg-opacity-50"
                  role="dialog"
                  tabIndex={0}
                  onClick={handleToggleModal}
                >
                  <div
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-7 w-[500px] max-w-full"
                    onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
                  >
                    <div className="text-center">
                      <h3 id="classroom-add" className="block text-2xl font-bold text-gray-800">
                        新增教室
                      </h3>
                    </div>
                    <div className="h-6" />
                    <div className="grid gap-y-4">
                      <p className="block text-sm">教室名稱</p>
                      <input
                        id="name"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomName}
                        onChange={(event) => setClassroomName(event.target.value)}
                      />

                      <p className="block text-sm">教室位置</p>
                      <input
                        id="place"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomPlace}
                        onChange={(event) => setClassroomPlace(event.target.value)}
                      />

                      <p className="block text-sm">教室描述</p>
                      <input
                        id="description"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomDescription}
                        onChange={(event) => setClassroomDescription(event.target.value)}
                      />

                      <div>
                        <button
                          type="button"
                          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-white disabled:pointer-events-none"
                          onClick={startAddClassroom}
                          disabled={isDisabled}
                        >
                          新增
                        </button>
                      </div>

                      {message && (
                        <div className={`p-4 text-sm rounded-lg ${messageType == 1 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                          {message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="max-w-[85rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 mx-auto">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {swrData.map(
                    (
                      item: {
                        id: string;
                        name: string;
                        description: string;
                        place: string;
                      },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="group flex flex-col h-72 bg-white border border-gray-200 shadow-sm hover:shadow-md focus:outline-none focus:shadow-md transition rounded-xl"
                        role="button"
                        onClick={() => checkClassroom(item.id)}
                      >
                        <div className="h-full flex flex-col justify-center items-center bg-blue-600 rounded-t-xl relative overflow-hidden">
                          <Image src="/images/classroom.jpg" alt="Classroom" fill className="object-cover" />
                        </div>
                        <div className="p-4 md:p-6">
                          <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                          <p className="mt-3">教室描述: {item.description}</p>
                          <p>教室位置: {item.place}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
