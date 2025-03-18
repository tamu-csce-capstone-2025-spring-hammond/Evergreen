import { useState } from "react";

export default function News() {
    const [newsArticles, setNewsArticles] = useState([]);

    const fetchNews = async () => {
        try {
            const response = await fetch("http://localhost:4000/news", {
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
        <div>
            {
                newsArticles.map((article) => (
                    <div>
                    </div>
                ))
            }
        </div>
    );
}
