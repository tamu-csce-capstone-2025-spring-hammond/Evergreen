const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface NewsArticle {
    author: string;
    content: string;
    created_at: string;
    headline: string;
    id: number;
    images: NewsImage[];
    source: string;
    summary: string;
    symbols: string[];
    updated_at: string;
    url: string;
}

export interface NewsImage {
    size: string;
    url: string;
}

export interface NewsResponse {
    news: NewsArticle[];
    next_page_token: string;
}

export const getNews = async (token: string) => {
    if (!backendUrl) {
        console.error("Backend URL is not defined");
        return;
    }

    const response = await fetch(`${backendUrl}/news`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    });

    if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
    
}