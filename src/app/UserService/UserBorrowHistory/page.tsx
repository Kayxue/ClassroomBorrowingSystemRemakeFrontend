"use client";
import { ChangeEvent, useState } from "react";
import CheckPermission from "@/context/permissionCheck";
import { GoBackLogin } from "@/components/GoBackLogin";
import Link from "next/link";
import RecordList from "../../../components/RecordList";

export default function UserProfile() {
  const { data, isLoading } = CheckPermission();
 

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
                className="text-xl flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
              >
                個人資料
              </Link>
              <Link
                href="/UserService/UpdatePassword"
                className="text-xl flex items-center px-3 py-2.5 font-semibold  hover:text-indigo-900 hover:border hover:rounded-full"
              >
                更改密碼
              </Link>
              <Link
                href="/UserService/UserBorrowHistory"
                className="text-xl flex items-center px-3 py-2.5 font-bold bg-white  text-indigo-900 border rounded-full"
              >
                借用紀錄
              </Link>
            </div>
          </aside>
          <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4 flex-auto">
            <div className="p-2 md:p-4">
              <div className="w-full px-6 pb-8 mt-8">
                <div className=" mx-auto mt-8">
                <RecordList type={2} />
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
