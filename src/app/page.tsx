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
			.catch(() => ({ data: "" }));
		setData(JSON.stringify(result.data));
	}

	return (
		<>
			<input
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			></input>
			<input
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			></input>
			<button onClick={() => login()}>login</button>
			<button onClick={() => getProfile()}>profile</button>
			<p>{data}</p>
		</>
	);
}
