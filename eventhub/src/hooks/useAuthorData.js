import { useState, useEffect } from "react";
import { getUserLikes } from "@/api/userLikesApi";
import { API_BASE_URL } from "@/config/api";
import { getUserDisplayName } from "@/utils/userHelpers";

const USERS_API_URL = `${API_BASE_URL}/users`;

/**
 * Custom hook for fetching and managing author data
 * @param {string} eventCreatorId - The ID of the event creator
 * @param {number} externalAuthorLikesCount - Optional external author likes count
 * @returns {Object} Author data including name, likes count, and loading state
 */
export function useAuthorData(eventCreatorId, externalAuthorLikesCount) {
  const [authorName, setAuthorName] = useState(null);
  const [authorLikesCount, setAuthorLikesCount] = useState(externalAuthorLikesCount ?? 0);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  // Load author name
  useEffect(() => {
    if (eventCreatorId) {
      setIsLoadingAuthor(true);
      fetch(`${USERS_API_URL}/${eventCreatorId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch author");
          }
          return res.json();
        })
        .then(userData => {
          const username = getUserDisplayName(userData, "Неизвестен");
          setAuthorName(username);
        })
        .catch(() => {
          setAuthorName("Неизвестен");
        })
        .finally(() => setIsLoadingAuthor(false));
    }
  }, [eventCreatorId]);

  // Load or update author likes
  useEffect(() => {
    if (eventCreatorId) {
      if (externalAuthorLikesCount !== undefined) {
        setAuthorLikesCount(externalAuthorLikesCount);
      } else {
        getUserLikes(eventCreatorId)
          .then(likes => setAuthorLikesCount(likes.length))
          .catch(() => {
            setAuthorLikesCount(0);
          });
      }
    }
  }, [eventCreatorId, externalAuthorLikesCount]);

  return {
    authorName,
    authorLikesCount,
    isLoadingAuthor
  };
}

