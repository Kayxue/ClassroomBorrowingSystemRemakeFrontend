"use client";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();

	function goToLogin() {
		router.push('/login');
	}

	return ( 
		<div className="h-[30rem] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
		<div className="max-w-2xl mx-auto p-4">
		  <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
			教室借用系統
		  </h1>
		  <p></p>
		  <p className="text-neutral-500 max-w-lg mx-auto my-2 text-base text-center relative z-10">
		   歡迎來到教室借用系統，請敬請的使用吧！！！
		  </p>
		</div>
		<button 
			onClick={() => goToLogin()}
			className="bg-blue-500 text-white rounded-2xl px-5 py-1 focus:ring-blue-300 focus:ring-2 "
		>
			login
		</button>
	  </div>
	);
}
