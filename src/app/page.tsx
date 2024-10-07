"use client";
import axios from "../axiosInstance/axiosWithCredentials";
import { useState } from "react";

export default function Home() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [data, setData] = useState("");

	async function login() {
		const result = await axios.post("http://localhost:3001/user/login", {
			username,
			password,
		});
		setData(JSON.stringify(result.data));
	}

	async function getProfile() {
		const result = await axios
			.get("http://localhost:3001/user/profile")
			.catch(() => ({ data: "Can't get any data" }));
		setData(JSON.stringify(result.data));
	}

	async function logout() {
		await axios.get("http://localhost:3001/user/logout");
		setData("Logged out");
	}

	return (
		<div className="space-x-2">
			<input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="username"
				className="border-2 border-black border-solid rounded-xl pl-2 pr-2"
			></input>
			<input
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="password"
				className="border-2 border-black border-solid rounded-xl pl-2 pr-2"
			></input>
			<button
				className="bg-green-300 text-white rounded-2xl pl-2 pr-2 focus:ring-2 focus:ring-green-300"
				onClick={() => login()}
			>
				login
			</button>
			<button
				className="bg-blue-500  text-white rounded-2xl pl-2 pr-2 focus:ring-blue-300 focus:ring-2"
				onClick={() => getProfile()}
			>
				profile
			</button>
			<button
				className="bg-red-500 text-white rounded-2xl pl-2 pr-2 focus:ring-red-300 focus:ring-2"
				onClick={() => logout()}
			>
				logout
			</button>
			<p>{data}</p>
		</div>
	);
}
