"use client";
import checkPermission from "@/context/permissionCheck";
import { useParams } from "next/navigation";
import useSWR from "swr";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    credentials: "include",
  }).then((res) => res.json());

export default function BorrowId() {
  const { data, isLoading } = checkPermission();
  const params = useParams<{ id: string }>(); // 為 useParams 添加類型定義，指定其返回的參數結構
  const classroomId = params?.id; // 確保 id 可以處理可能的 undefined
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const daysContainerRef = useRef<HTMLDivElement | null>(null);
  const datepickerContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [selectedValue2, setSelectedValue2] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<number | null>(0);
  const [classroomName, setClassroomName] = useState<string>("");
  const [classroomPlace, setClassroomPlace] = useState<string>("");
  const [classroomDescription, setClassroomDescription] = useState<string>("");
  const [isModalOpen3, setModalOpen3] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value === "" ? null : parseInt(value, 10));
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue2(value === "" ? null : parseInt(value, 10));
  };

  const handleToggleModal3 = () => {
    setModalOpen3(!isModalOpen3);
  };

  useEffect(() => {
    if (daysContainerRef.current) {
      renderCalendar();
    }
  }, [currentDate, isCalendarOpen]);

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysContainer = daysContainerRef.current;
    if (!daysContainer) return;

    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyDiv = document.createElement("div");
      daysContainer.appendChild(emptyDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.className =
        "flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border-[.5px] border-transparent text-dark hover:border-stroke hover:bg-gray-2 sm:h-[40px] sm:w-[40px] mb-2";
      dayDiv.textContent = i.toString(); // 使用 padStart 來補零

      dayDiv.addEventListener("click", () => {
        const formattedDay = i.toString().padStart(2, "0"); // 同樣對 i 進行補零
        const formattedMonth = (month + 1).toString().padStart(2, "0"); // 同樣補零來格式化月份
        const selectedDateValue = `${year}-${formattedMonth}-${formattedDay}`;

        setSelectedDate(selectedDateValue);

        daysContainer.querySelectorAll("div").forEach((d) => d.classList.remove("bg-[#3758f9]", "text-white"));

        dayDiv.classList.add("bg-[#3758f9]", "text-white");
      });

      daysContainer.appendChild(dayDiv);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleApply = () => {
    if (selectedDate) {
      setIsCalendarOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setIsCalendarOpen(false);
  };

  const handleToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      datepickerContainerRef.current &&
      !datepickerContainerRef.current.contains(event.target as Node) &&
      (event.target as HTMLElement).id !== "datepicker" &&
      (event.target as HTMLElement).id !== "toggleDatepicker"
    ) {
      setIsCalendarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const openModal = () => {
    setMessage(null);
    setMessageType(0);
    setSelectedDate(null);
    setSelectedValue(null);
    setSelectedValue2(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal2 = () => {
    setMessage(null);
    setMessageType(0);
    setClassroomName(swrData.name);
    setClassroomPlace(swrData.place);
    setClassroomDescription(swrData.description);
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  };

  const {
    data: swrData,
    error: swrError,
    isLoading: swrLoading,
  } = useSWR(`http://localhost:3001/classroom/getClassroom/${classroomId}`, fetcher, {
    revalidateOnFocus: false, // Disable re-fetching when the window is refocused
    revalidateOnReconnect: false, // Disable re-fetching on network reconnect
    shouldRetryOnError: false, // Disable retrying on error
  });

  const startBorrow = async () => {
    if (!selectedDate?.trim() || !selectedValue || !selectedValue2) {
      setMessage("全部欄位都必須填寫");
      setMessageType(0);
      return;
    }

    if (selectedValue > selectedValue2) {
      setMessage("時間輸入錯誤，開始時間應早於結束時間");
      setMessageType(0);
      return;
    }

    try {
      const response = await fetch("http://worldtimeapi.org/api/timezone/Etc/UTC", {
        method: "GET",
      });

      const json = await response.json();
      const currentUnixTime = json.unixtime;
      const selectedUnixTime = Math.floor(new Date(selectedDate).getTime() / 1000);

      // 比較到日期的層級
      const currentDate = new Date(currentUnixTime * 1000);
      const selectedDateOnly = new Date(selectedUnixTime * 1000);

      // 去掉時間部分，只保留年月日進行比較
      currentDate.setHours(0, 0, 0, 0);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (currentDate.getTime() == selectedDateOnly.getTime()) {
        setMessage("只能預約明天");
        setMessageType(0);
        return;
      } else if (currentDate.getTime() > selectedDateOnly.getTime()) {
        setMessage("無法預約過去的時間");
        setMessageType(0);
        return;
      }
    } catch (error) {
      setMessage("無法取得時間");
      setMessageType(0);
      return;
    }

    setIsDisabled(true);

    let borrowData = {
      userId: data.id,
      startTime: selectedDate,
      endTime: selectedDate,
      from: selectedValue,
      to: selectedValue2,
      classroomId: classroomId,
    };

    try {
      const response = await fetch("http://localhost:3001/borrow/insertBorrow", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(borrowData),
      });

      const json = await response.json();
      setMessage(json.message);
      setMessageType(json.success ? 1 : 0);

      if (json.success == 1) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(String(error));
      setMessageType(0);
      setIsDisabled(false);
    }
  };

  const startBorrowEdit = async () => {
    const isInvalidField = (value: string) => !value || /\s/.test(value);

    if (isInvalidField(classroomName) || isInvalidField(classroomPlace) || isInvalidField(classroomDescription)) {
      setMessage("全部欄位都必須填寫且不能有空白");
      setMessageType(0);
      return;
    }

    setIsDisabled(true);

    let borrowData = {
      classroomId: classroomId,
      name: classroomName,
      place: classroomPlace,
      description: classroomDescription,
    };

    try {
      const response = await fetch("http://localhost:3001/classroom/updateClassroom", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(borrowData),
      });

      const json = await response.json();

      if (json.affectedRows > 0) {
        setMessage("成功更新教室");
        setMessageType(1);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage("更新教室失敗");
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

  const deleteClassroom = async () => {
    setIsDisabled(true);

    let classroomData = {
      classroomId: classroomId,
    };

    try {
      await fetch("http://localhost:3001/classroom/deleteClassroom", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classroomData),
      });

      router.push("/borrow/");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      {isLoading || swrLoading ? (
        <div></div>
      ) : (
        <>
          {!data ? (
            <div>need to login</div>
          ) : (
            <>
              <div className="h-16" />
              <div>
                <p className="text-lg md:text-5xl bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-bold">
                  {swrData.name}
                </p>
              </div>
              <div className="h-16" />
              <div className="flex">
                <div className="border block rounded-lg text-surface shadow-secondary-1 w-full">
                  <div className="border-b-2 border-neutral-100 px-6 py-3 font-bold text-lg md:text-x;">教室位置</div>
                  <div className="p-6">
                    <p>{swrData.place}</p>
                  </div>
                </div>
              </div>
              <div className="h-8" />
              <div className="flex">
                <div className="border block rounded-lg text-surface shadow-secondary-1 w-full">
                  <div className="border-b-2 border-neutral-100 px-6 py-3 font-bold text-lg md:text-x;">教室描述</div>
                  <div className="p-6">
                    <p>{swrData.description}</p>
                  </div>
                </div>
              </div>
              <div className="h-8" />
              <button
                className="py-3 px-4 mx-1 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:pointer-events-none"
                aria-expanded={isModalOpen ? "true" : "false"}
                onClick={openModal}
                disabled={isDisabled}
              >
                預約
              </button>

              {data.role == "Admin" && (
                <button
                  className="py-3 px-4 mx-1 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-black text-white focus:outline-none disabled:pointer-events-none"
                  aria-expanded={isModalOpen2 ? "true" : "false"}
                  onClick={openModal2}
                  disabled={isDisabled}
                >
                  修改
                </button>
              )}

              {data.role == "Admin" && (
                <button
                  className="py-3 px-4 mx-1 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-600 text-white focus:outline-none disabled:pointer-events-none"
                  aria-expanded={isModalOpen3 ? "true" : "false"}
                  onClick={handleToggleModal3}
                  disabled={isDisabled}
                >
                  刪除
                </button>
              )}

              {isModalOpen3 && (
                <div
                  id="hs-danger-alert"
                  className="size-full fixed inset-0 z-50 overflow-x-hidden overflow-y-auto flex items-center justify-center"
                  role="dialog"
                  tabIndex={2}
                  aria-labelledby="hs-danger-alert-label"
                  onClick={handleToggleModal3}
                >
                  <div
                    className="mt-7 opacity-100 duration-500 ease-out transition-all md:max-w-2xl md:w-full m-3 md:mx-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative flex flex-col bg-white border shadow-sm rounded-xl overflow-hidden">
                      <div className="absolute top-2 end-2">
                        <button
                          type="button"
                          className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:pointer-events-none"
                          aria-label="Close"
                          onClick={handleToggleModal3}
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
                          {/* Icon */}
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
                          {/* End Icon */}

                          <div className="grow">
                            <h3 id="hs-danger-alert-label" className="mb-2 text-xl font-bold text-gray-800">
                              刪除教室
                            </h3>
                            <p className="text-gray-500">此操作不可逆，因此請謹慎繼續。</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end items-center gap-x-2 py-3 px-4 bg-gray-50 border-t">
                        <button
                          type="button"
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50"
                          onClick={handleToggleModal3}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 disabled:pointer-events-none"
                          onClick={deleteClassroom}
                          disabled={isDisabled}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isModalOpen2 && (
                <div
                  id="borrow-classroom-edit"
                  className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto flex items-center justify-center"
                  role="dialog"
                  tabIndex={0}
                  onClick={closeModal2}
                >
                  <div
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-7 w-[500px] max-w-full"
                    onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
                  >
                    <div className="text-center">
                      <h3 id="borrow-classroom-edit" className="block text-2xl font-bold text-gray-800">
                        修改教室
                      </h3>
                    </div>
                    <div className="h-6" />
                    <div className="grid gap-y-4">
                      <p className="block text-sm">教室名稱</p>
                      <input
                        id="classroomName"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomName}
                        onChange={(event) => setClassroomName(event.target.value)}
                      />

                      <p className="block text-sm">教室位置</p>
                      <input
                        id="classroomPlace"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomPlace}
                        onChange={(event) => setClassroomPlace(event.target.value)}
                      />

                      <p className="block text-sm">教室描述</p>
                      <input
                        id="classroomDescription"
                        type="text"
                        className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-5 text-dark outline-none focus:border-[#3758f9]"
                        value={classroomDescription}
                        onChange={(event) => setClassroomDescription(event.target.value)}
                      />

                      <div>
                        <button
                          type="button"
                          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-green-500 text-white focus:outline-none disabled:pointer-events-none"
                          onClick={startBorrowEdit}
                          disabled={isDisabled}
                        >
                          修改
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

              {isModalOpen && (
                <div
                  id="borrow-classroom"
                  className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto flex items-center justify-center"
                  role="dialog"
                  tabIndex={-1}
                  onClick={closeModal}
                >
                  <div
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-7 w-[500px] max-w-full"
                    onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
                  >
                    <div className="text-center">
                      <h3 id="borrow-classroom" className="block text-2xl font-bold text-gray-800">
                        預約時間
                      </h3>
                    </div>
                    <div className="h-6" />
                    <p className="block text-sm mb-2">日期</p>
                    <div>
                      <div className="mx-auto w-full max-w-[510px]">
                        <div className="relative mb-3">
                          <input
                            id="datepicker"
                            type="text"
                            placeholder="請選擇日期"
                            className="h-12 w-full appearance-none rounded-lg border border-stroke bg-white pl-12 pr-4 text-dark outline-none focus:border-[#3758f9]"
                            value={selectedDate || ""}
                            readOnly
                            onClick={handleToggleCalendar}
                          />
                          <span
                            id="toggleDatepicker"
                            onClick={handleToggleCalendar}
                            className="absolute inset-y-0 flex h-12 w-12 items-center justify-center text-dark-5"
                          >
                            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M18 3.3125H16.3125V2.625C16.3125 2.25 16 1.90625 15.5937 1.90625C15.1875 1.90625 14.875 2.21875 14.875 2.625V3.28125H6.09375V2.625C6.09375 2.25 5.78125 1.90625 5.375 1.90625C4.96875 1.90625 4.65625 2.21875 4.65625 2.625V3.28125H3C1.9375 3.28125 1.03125 4.15625 1.03125 5.25V16.125C1.03125 17.1875 1.90625 18.0938 3 18.0938H18C19.0625 18.0938 19.9687 17.2187 19.9687 16.125V5.25C19.9687 4.1875 19.0625 3.3125 18 3.3125ZM3 4.71875H4.6875V5.34375C4.6875 5.71875 5 6.0625 5.40625 6.0625C5.8125 6.0625 6.125 5.75 6.125 5.34375V4.71875H14.9687V5.34375C14.9687 5.71875 15.2812 6.0625 15.6875 6.0625C16.0937 6.0625 16.4062 5.75 16.4062 5.34375V4.71875H18C18.3125 4.71875 18.5625 4.96875 18.5625 5.28125V7.34375H2.46875V5.28125C2.46875 4.9375 2.6875 4.71875 3 4.71875ZM18 16.6562H3C2.6875 16.6562 2.4375 16.4062 2.4375 16.0937V8.71875H18.5312V16.125C18.5625 16.4375 18.3125 16.6562 18 16.6562Z"
                                fill="currentColor"
                              />
                              <path
                                d="M9.5 9.59375H8.8125C8.625 9.59375 8.5 9.71875 8.5 9.90625V10.5938C8.5 10.7812 8.625 10.9062 8.8125 10.9062H9.5C9.6875 10.9062 9.8125 10.7812 9.8125 10.5938V9.90625C9.8125 9.71875 9.65625 9.59375 9.5 9.59375Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12.3438 9.59375H11.6562C11.4687 9.59375 11.3438 9.71875 11.3438 9.90625V10.5938C11.3438 10.7812 11.4687 10.9062 11.6562 10.9062H12.3438C12.5312 10.9062 12.6562 10.7812 12.6562 10.5938V9.90625C12.6562 9.71875 12.5312 9.59375 12.3438 9.59375Z"
                                fill="currentColor"
                              />
                              <path
                                d="M15.1875 9.59375H14.5C14.3125 9.59375 14.1875 9.71875 14.1875 9.90625V10.5938C14.1875 10.7812 14.3125 10.9062 14.5 10.9062H15.1875C15.375 10.9062 15.5 10.7812 15.5 10.5938V9.90625C15.5 9.71875 15.375 9.59375 15.1875 9.59375Z"
                                fill="currentColor"
                              />
                              <path
                                d="M6.5 12H5.8125C5.625 12 5.5 12.125 5.5 12.3125V13C5.5 13.1875 5.625 13.3125 5.8125 13.3125H6.5C6.6875 13.3125 6.8125 13.1875 6.8125 13V12.3125C6.8125 12.125 6.65625 12 6.5 12Z"
                                fill="currentColor"
                              />
                              <path
                                d="M9.5 12H8.8125C8.625 12 8.5 12.125 8.5 12.3125V13C8.5 13.1875 8.625 13.3125 8.8125 13.3125H9.5C9.6875 13.3125 9.8125 13.1875 9.8125 13V12.3125C9.8125 12.125 9.65625 12 9.5 12Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12.3438 12H11.6562C11.4687 12 11.3438 12.125 11.3438 12.3125V13C11.3438 13.1875 11.4687 13.3125 11.6562 13.3125H12.3438C12.5312 13.3125 12.6562 13.1875 12.6562 13V12.3125C12.6562 12.125 12.5312 12 12.3438 12Z"
                                fill="currentColor"
                              />
                              <path
                                d="M15.1875 12H14.5C14.3125 12 14.1875 12.125 14.1875 12.3125V13C14.1875 13.1875 14.3125 13.3125 14.5 13.3125H15.1875C15.375 13.3125 15.5 13.1875 15.5 13V12.3125C15.5 12.125 15.375 12 15.1875 12Z"
                                fill="currentColor"
                              />
                              <path
                                d="M6.5 14.4062H5.8125C5.625 14.4062 5.5 14.5312 5.5 14.7187V15.4062C5.5 15.5938 5.625 15.7188 5.8125 15.7188H6.5C6.6875 15.7188 6.8125 15.5938 6.8125 15.4062V14.7187C6.8125 14.5312 6.65625 14.4062 6.5 14.4062Z"
                                fill="currentColor"
                              />
                              <path
                                d="M9.5 14.4062H8.8125C8.625 14.4062 8.5 14.5312 8.5 14.7187V15.4062C8.5 15.5938 8.625 15.7188 8.8125 15.7188H9.5C9.6875 15.7188 9.8125 15.5938 9.8125 15.4062V14.7187C9.8125 14.5312 9.65625 14.4062 9.5 14.4062Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12.3438 14.4062H11.6562C11.4687 14.4062 11.3438 14.5312 11.3438 14.7187V15.4062C11.3438 15.5938 11.4687 15.7188 11.6562 15.7188H12.3438C12.5312 15.7188 12.6562 15.5938 12.6562 15.4062V14.7187C12.6562 14.5312 12.5312 14.4062 12.3438 14.4062Z"
                                fill="currentColor"
                              />
                            </svg>
                          </span>
                        </div>

                        {isCalendarOpen && (
                          <div
                            ref={datepickerContainerRef}
                            id="datepicker-container"
                            className="flex w-full flex-col rounded-xl bg-white p-2 border shadow-four sm:p-4 mb-3"
                          >
                            <div className="flex items-center justify-between pb-2">
                              <button
                                id="prevMonth"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-stroke bg-gray-2 text-dark hover:border-[#3758f9] hover:bg-[#3758f9] hover:text-white"
                                onClick={handlePrevMonth}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="fill-current"
                                >
                                  <path d="M16.2375 21.4875C16.0125 21.4875 15.7875 21.4125 15.6375 21.225L7.16249 12.6C6.82499 12.2625 6.82499 11.7375 7.16249 11.4L15.6375 2.77498C15.975 2.43748 16.5 2.43748 16.8375 2.77498C17.175 3.11248 17.175 3.63748 16.8375 3.97498L8.96249 12L16.875 20.025C17.2125 20.3625 17.2125 20.8875 16.875 21.225C16.65 21.375 16.4625 21.4875 16.2375 21.4875Z" />
                                </svg>
                              </button>

                              <span id="currentMonth" className="text-lg font-medium capitalize text-dark">
                                {currentDate.toLocaleDateString("zh-TW", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>

                              <button
                                id="nextMonth"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-stroke bg-gray-2 text-dark hover:border-[#3758f9] hover:bg-[#3758f9] hover:text-white"
                                onClick={handleNextMonth}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="fill-current"
                                >
                                  <path d="M7.7625 21.4875C7.5375 21.4875 7.35 21.4125 7.1625 21.2625C6.825 20.925 6.825 20.4 7.1625 20.0625L15.0375 12L7.1625 3.97498C6.825 3.63748 6.825 3.11248 7.1625 2.77498C7.5 2.43748 8.025 2.43748 8.3625 2.77498L16.8375 11.4C17.175 11.7375 17.175 12.2625 16.8375 12.6L8.3625 21.225C8.2125 21.375 7.9875 21.4875 7.7625 21.4875Z" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid grid-cols-7 justify-between text-center pb-1 pt-2 text-xs font-medium capitalize text-body-color">
                              <span className="flex h-8 w-8 items-center justify-center">Mo</span>
                              <span className="flex h-8 w-8 items-center justify-center">Tu</span>
                              <span className="flex h-8 w-8 items-center justify-center">We</span>
                              <span className="flex h-8 w-8 items-center justify-center">Th</span>
                              <span className="flex h-8 w-8 items-center justify-center">Fr</span>
                              <span className="flex h-8 w-8 items-center justify-center">Sa</span>
                              <span className="flex h-8 w-8 items-center justify-center">Su</span>
                            </div>
                            <div ref={daysContainerRef} id="days-container" className="grid grid-cols-7 text-center text-xs font-medium">
                              {/* Days will be rendered here */}
                            </div>
                            <div className="flex items-center space-x-2 pt-3">
                              <button
                                id="cancelBtn"
                                className="flex h-10 w-full items-center justify-center rounded-md border border-[#3758f9] text-[#3758f9] border-opacity-100 text-sm font-medium"
                                onClick={handleCancel}
                              >
                                取消
                              </button>
                              <button
                                id="cancelBtn"
                                className="flex h-10 w-full items-center justify-center border rounded-md bg-[#3758f9] text-sm font-medium text-white"
                                onClick={handleApply}
                                disabled={isDisabled}
                              >
                                確認
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-y-4">
                        <div>
                          <p className="block text-sm mb-2">第幾節課開始</p>
                          <div className="relative">
                            <select
                              id="from"
                              value={selectedValue !== null ? selectedValue : ""}
                              onChange={handleChange}
                              className="border py-3 px-4 pe-9 block w-full rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none"
                            >
                              <option value="" disabled>
                                請選擇
                              </option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                              <option value={5}>5</option>
                              <option value={6}>6</option>
                              <option value={7}>7</option>
                              <option value={8}>8</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <p className="block text-sm mb-2">第幾節課結束</p>
                          <div className="relative">
                            <select
                              id="to"
                              value={selectedValue2 !== null ? selectedValue2 : ""}
                              onChange={handleChange2}
                              className="border py-3 px-4 pe-9 block w-full rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none"
                            >
                              <option value="" disabled>
                                請選擇
                              </option>
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                              <option value={5}>5</option>
                              <option value={6}>6</option>
                              <option value={7}>7</option>
                              <option value={8}>8</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:pointer-events-none"
                          onClick={startBorrow}
                        >
                          預約
                        </button>
                      </div>
                      {message && (
                        <div className="mt-5">
                          <div className={`p-4 text-sm rounded-lg ${messageType == 1 ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                            {message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
