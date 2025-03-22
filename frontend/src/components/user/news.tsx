"use client";

import { useState, useEffect } from "react";

export default function News() {
    const [newsArticles, setNewsArticles] = useState([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        if (!backendUrl) {
            console.error("REACT_APP_BACKEND_URL is not defined");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}news`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setNewsArticles(data);
        } catch (error: any) {
            console.error("Error fetching news:", error.message);
        }
    };

    return (
        <div className="p-4 bg-evergray-400">
            hi
            {newsArticles.map((article, index) => (
                <div key={index}>
                </div>
            ))}
        </div>
    );
}
