"use client";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { method: "GET", credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });

function checkPermission() {
  const { data, error, isValidating } = useSWR(
    "http://localhost:3001/user/profile",
    fetcher,
    {
      revalidateOnFocus: false, // Disable re-fetching when the window is refocused
      revalidateOnReconnect: false, // Disable re-fetching on network reconnect
      shouldRetryOnError: false, // Disable retrying on error
    }
  );

  return {
    data,
    error,
    isLoading: isValidating,
    isError: error,
    isEmpty: !data,
  };
}

export default checkPermission;
