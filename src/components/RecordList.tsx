"use client";
import checkPermission from "@/context/permissionCheck";
import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";

type BorrowRecordsProps = {
  type: number;
  param?: any;
};

// Fetcher function for API calls
const fetcher = (url: string) =>
  fetch(url, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      return []; // Return empty array or default data
    });

// type: 1 是 Borrow 使用, 2 是 User 使用
// <RecordList type={1} param={classroomId} />
// <RecordList type={2} />

export default function BorrowRecords({ type, param }: BorrowRecordsProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [filterBeforeToday, setFilterBeforeToday] = useState(true);
  const { data, isLoading } = checkPermission();

  // 分頁相關狀態
  const [currentPage1, setCurrentPage1] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage = 10; // 每頁最多 10 筆

  let url1, url2;

  if (type === 1) {
    url1 = `http://localhost:3001/classroom/getClassroom/${param}?borrows=true&isToday=true`;
    url2 = `http://localhost:3001/classroom/getClassroom/${param}?borrows=true`;
  } else if (type === 2) {
    url1 = `http://localhost:3001/user/profile?isToday=true`;
    url2 = `http://localhost:3001/user/profile`;
  }

  const {
    data: todayBorrowResponse,
    error: error1,
    isLoading: isLoading1,
    mutate: mutate1,
  } = useSWR(url1, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const {
    data: allBorrowResponse,
    error: error2,
    isLoading: isLoading2,
    mutate: mutate2,
  } = useSWR(url2, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  const tabButtonClasses = (tabNumber: number) => {
    const baseClasses =
      "relative min-w-0 flex-1 bg-white first:border-s-0 border-s border-b-2 py-4 px-4 text-sm font-medium text-center overflow-hidden focus:z-10 focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    const activeClasses = "text-gray-900 border-b-blue-600";
    const inactiveClasses = "text-gray-500 hover:text-gray-700 hover:bg-gray-50";

    return `${baseClasses} ${activeTab === tabNumber ? activeClasses : inactiveClasses}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const formatTime = (from: number, to: number) => {
    return `第${from}${from === to ? "" : `到${to}`}節`;
  };

  const handleDelete = async (id: string, user: string, tabs: number) => {
    if (isDisabled) return;
    if (!window.confirm("確定要刪除此紀錄嗎？")) return;
    setIsDisabled(true);
    const borrowingData = { borrowId: id };
    tabs-=1;
    try {
      if(!(data.username === user) && data.role === "Teacher") {
        window.confirm("不可刪除他人資料!")
        return;
      }

      const response = await fetch("http://localhost:3001/borrow/deleteBorrow", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(borrowingData),
      });

      if (response.ok) {
        alert("刪除成功");
        !tabs?mutate1():mutate2();
      } else {
        alert("刪除失敗");
      }
    } catch (error) {
      console.error("刪除失敗:", error);
      alert("刪除失敗");
    } finally {
      setIsDisabled(false);
    }
  };

  if (isLoading1 || isLoading2) return <div></div>;
  if (error1 || error2) return <div>載入失敗</div>;

  const classroomName = allBorrowResponse?.name || "未知教室";
  const userName = allBorrowResponse?.username || "未知使用者";

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 設定當日的時間為 00:00:00

  const allBorrow = (type === 1 ? allBorrowResponse?.borrowingDatas : allBorrowResponse?.borrows)
  ?.filter((item: any) =>
    filterBeforeToday ? new Date(item.startTime) >= today : true // 過濾今天以前的資料
  )
  .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // 按借用日期排序

  const todayBorrow = (type === 1 ? todayBorrowResponse?.borrowingDatas : todayBorrowResponse?.borrows)
  ?.filter((item: any) =>
    filterBeforeToday ? new Date(item.startTime) >= today : true // 過濾今天以前的資料
  )
  .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // 按借用日期排序

  // 分頁資料計算
  const totalToday = todayBorrow?.length || 0;
  const totalPages1 = Math.ceil(totalToday / itemsPerPage);
  const startIndex1 = (currentPage1 - 1) * itemsPerPage;
  const endIndex1 = startIndex1 + itemsPerPage;
  const pagedToday = todayBorrow?.slice(startIndex1, endIndex1) || [];

  const totalAll = allBorrow?.length || 0;
  const totalPages2 = Math.ceil(totalAll / itemsPerPage);
  const startIndex2 = (currentPage2 - 1) * itemsPerPage;
  const endIndex2 = startIndex2 + itemsPerPage;
  const pagedAll = allBorrow?.slice(startIndex2, endIndex2) || [];

  const handlePageChange1 = (page: number) => {
    if (page < 1 || page > totalPages1) return;
    setCurrentPage1(page);
  };

  const handlePageChange2 = (page: number) => {
    if (page < 1 || page > totalPages2) return;
    setCurrentPage2(page);
  };

  const handleFilterChange = () => {
    setFilterBeforeToday(!filterBeforeToday);
    setCurrentPage2(1); // 重置到第一頁
  };
  
  const isToday = (date: string) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // 將目標日期時間歸零
    return today.getTime() === targetDate.getTime();
  };

  const isBeforeToday = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate.getTime() < today.getTime();
  };

  return (
    <div className="mt-3 mb-5">
      <nav className="relative z-0 flex border rounded-xl overflow-hidden my-6" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
        <button type="button" className={tabButtonClasses(1)} onClick={() => setActiveTab(1)} aria-selected={activeTab === 1}>
          今日借用紀錄
        </button>
        <button type="button" className={tabButtonClasses(2)} onClick={() => setActiveTab(2)} aria-selected={activeTab === 2}>
          全部借用紀錄
        </button>
      </nav>
      {activeTab !== 1 && (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="filterCheckbox"
            checked={filterBeforeToday}
            onChange={handleFilterChange}
            className="mr-2"
          />
          <label htmlFor="filterCheckbox" className="text-sm text-gray-700">
            過濾今天以前的資料
          </label>
        </div>
      )}
      {activeTab === 1 && (
        <div role="tabpanel">
          <div className="w-full mx-auto">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">教室名稱</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">使用者名稱</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用日期</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用時間</th>
                    {data.role === "Admin"?
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                      :null
                    }
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagedToday?.length > 0 ? (
                    pagedToday.map((item: any, index: number) => (
                      <tr key={index}
                        className={`${
                          isToday(item.startTime)
                            ? "bg-yellow-100 text-yellow-700 font-bold"
                            : isBeforeToday(item.startTime)
                              ? "bg-red-100 text-red-700"
                              : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {type === 1 ? (
                            todayBorrowResponse?.name
                          ) : (
                            <Link href={`/borrow/${item.classroomId}`} className="text-blue-600 hover:text-blue-900">
                              {item.classroom.name}
                            </Link>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{type === 1 ? item.user.username : userName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.startTime)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(item.from, item.to)}</td>
                        {data.role === "Teacher"?
                          <td className="px-6 py-4 text-sm font-medium">
                            <button onClick={() => handleDelete(param, item.user.username, 1)} className="text-red-600 hover:text-red-900" disabled={isDisabled}>
                              刪除
                            </button>
                          </td>
                        :null
                        }
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        沒有今日借用紀錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 分頁按鈕 */}
            {totalPages1 > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange1(currentPage1 - 1)}
                  disabled={currentPage1 === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  上一頁
                </button>
                <span className="text-sm">
                  第 {currentPage1} 頁，共 {totalPages1} 頁
                </span>
                <button
                  onClick={() => handlePageChange1(currentPage1 + 1)}
                  disabled={currentPage1 === totalPages1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  下一頁
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div role="tabpanel">
          <div className="w-full mx-auto">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">教室名稱</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">使用者名稱</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用日期</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用時間</th>
                    {data.role === "Admin"?
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                      :null
                    }                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagedAll?.length > 0 ? (
                    pagedAll.map((item: any, index: number) => (
                      <tr key={index}
                      className={`${
                        isToday(item.startTime)
                          ? "bg-yellow-100 text-yellow-700 font-bold"
                          : isBeforeToday(item.startTime)
                            ? "bg-red-100 text-red-700"
                            : ""
                      }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {type === 1 ? (
                            classroomName
                          ) : (
                            <Link href={`/borrow/${item.classroomId}`} className="text-blue-600 hover:text-blue-900">
                              {item.classroom.name}
                            </Link>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{type === 1 ? item.user.username : userName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.startTime)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(item.from, item.to)}</td>
                        {data.role === "Admin"?
                          <td className="px-6 py-4 text-sm font-medium">
                            <button onClick={() => handleDelete(item.id, item.user.username ,2)} className="text-red-600 hover:text-red-900" disabled={isDisabled}>
                              刪除
                            </button>
                          </td>
                          :null
                        }
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        沒有借用紀錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* 分頁按鈕 */}
            {totalPages2 > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange2(currentPage2 - 1)}
                  disabled={currentPage2 === 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  上一頁
                </button>
                <span className="text-sm">
                  第 {currentPage2} 頁，共 {totalPages2} 頁
                </span>
                <button
                  onClick={() => handlePageChange2(currentPage2 + 1)}
                  disabled={currentPage2 === totalPages2}
                  className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
                >
                  下一頁
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}