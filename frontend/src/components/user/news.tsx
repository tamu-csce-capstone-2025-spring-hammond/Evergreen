"use client";

import useJwtStore from "@/store/jwtStore";
import { useState, useEffect } from "react";
import { NewsArticle, getNews } from "../api/news";

export default function News() {
  const { getToken } = useJwtStore();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const token = getToken();
    try {
      setLoading(true);
      if (!token) {
        throw new Error("No JWT token");
      }
      const data: NewsArticle[] = await getNews(token);
      setNewsArticles(data);
    } catch (error: any) {
      console.error("Error fetching news:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 text-evergray-500">
        <h2>Latest News</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <p>Loading news...</p>
          </div>
        ) : newsArticles.length === 0 ? (
          <div className="flex justify-center items-center p-4 text-evergray-400">
            <p>No news articles available.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 px-3 pb-3">
            {newsArticles.map((article, index) => (
              <div
                key={article.id || index}
                className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="flex-shrink-0 w-24 sm:w-32 relative">
                  {article.images && article.images.length > 0 ? (
                    <div className="relative h-full w-full">
                      <img
                        src={
                          article.images.find((img) => img.size === "small")
                            ?.url || article.images[0].url
                        }
                        alt={article.headline}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3">
                  <div className="flex flex-col h-full justify-between">
                    {/* Header */}
                    <div>
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors duration-200 text-gray-600"
                        >
                          {article.headline}
                        </a>
                      </h3>

                      {article.summary && (
                        <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                          {article.summary}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-1 flex flex-wrap justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2 text-xs">
                          {article.author || article.source}
                        </span>
                        <span className="text-xs">
                          {formatDate(article.created_at)}
                        </span>
                      </div>

                      {article.symbols && article.symbols.length > 0 && (
                        <div className="mt-1 sm:mt-0">
                          <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {article.symbols.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
