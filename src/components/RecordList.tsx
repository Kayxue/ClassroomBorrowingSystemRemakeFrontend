"use client";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// 用於從 API 抓取借用紀錄的 fetcher 函式
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
    return []; // 返回空陣列或其他預設資料
  });

// 根據 classroomId 獲取課堂名稱
const getName = async (classroomId: string) => {
  try {
    const response = await fetch(`http://localhost:3001/classroom/getClassroom/${classroomId}`);

    if (!response.ok) {
      throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.name) {
      return data.name;
    } else {
      throw new Error('回應中未找到課堂名稱');
    }
  } catch (error) {
    console.error('獲取課堂名稱失敗:', error);
    return null;
  }
};

export default function BorrowRecords() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [classroomNames, setClassroomNames] = useState<{ [key: string]: string | null }>({});
  const params = useParams<{ id: string }>();
  const borrowingId = params?.id;

  // 使用 SWR 抓取今日借用紀錄
  const { data, error, isLoading, mutate } = useSWR("http://localhost:3001/borrow/getTodayBorrow", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });

  // 格式化時間段
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const formatTime = (from: number, to: number) => {
    return `${'第'+from+(from == to ? "" : '到' + to)+'節'}`;
  };

  // 當借用紀錄加載時，為每個借用紀錄的課堂名稱發送請求
  useEffect(() => {
    if (data) {
      data.forEach(async (item: { borrowing: any; }) => {
        const { borrowing } = item;
        const classroomId = borrowing.classroomId;
        if (!classroomNames[classroomId]) {
          const name = await getName(classroomId);
          setClassroomNames((prev) => ({ ...prev, [classroomId]: name }));
        }
      });
    }
  }, [data]); // 當 data 變化時觸發

  const handleEdit = async () => {
    // 編輯借用紀錄邏輯
  };

  const handleDelete = async () => {
    if (isDisabled) return; // 防止重複刪除
    if (!window.confirm("確定要刪除此紀錄嗎？")) return; // 加入刪除確認

    setIsDisabled(true);
    let borrowingData = {
      borrowingId: borrowingId,
    };
    try {
      const response = await fetch("http://localhost:3001/borrowing/deleteBorrow", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(borrowingData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("刪除成功");
        mutate(); // 使用SWR的mutate來重新抓取資料
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

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>載入失敗</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="text-center my-6">
        <h1 className="text-xl md:text-3xl font-bold">今日借用紀錄</h1>
      </div>

      <div className="max-w-[85rem] mx-auto">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">教室名稱</th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">使用者名稱</th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用日期</th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">借用時間</th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((item: { user: { username: string, userId: string }, borrowing: { id: string, startTime: string, from: number, to: number, classroomId: string } }) => {
                  const { user, borrowing } = item;
                  const classroomName = classroomNames[borrowing.classroomId] || "載入中...";
                  return (
                    <tr key={borrowing.classroomId}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <Link href={`/borrow/${borrowing.classroomId}`} className="text-blue-600 hover:text-blue-900">
                          {classroomName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <Link href={`/user/${user.userId}`} className="text-blue-600 hover:text-blue-900">
                          {user.username}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(borrowing.startTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatTime(borrowing.from, borrowing.to)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right">
                        <button onClick={handleEdit} className="text-blue-600 hover:text-blue-900 mr-2">
                          修改時間
                        </button>
                        <button onClick={handleDelete} className="text-red-600 hover:text-red-900" disabled={isDisabled}>
                          刪除
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    沒有今日借用紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
