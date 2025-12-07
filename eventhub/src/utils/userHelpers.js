/**
 * Get display name for a user
 * 
 * Priority: username > name > email prefix > fallback
 * 
 * @param {Object} user - User object
 * @param {string} fallback - Fallback text if no name found (default: "Неизвестен")
 * @returns {string} Display name
 */
export function getUserDisplayName(user, fallback = "Неизвестен") {
  if (!user) return fallback;
  
  if (user.username) return user.username;
  if (user.name) return user.name;
  if (user.email) return user.email.split("@")[0];
  
  return fallback;
}

/**
 * Get display name from user ID by searching in users array
 * 
 * @param {number|string} userId - User ID
 * @param {Array} users - Array of user objects
 * @param {string} fallback - Fallback text if user not found (default: "Анонимен")
 * @returns {string} Display name
 */
export function getUserNameFromId(userId, users = [], fallback = "Анонимен") {
  const user = users.find(u => u.id === userId || u.id === Number(userId));
  if (!user) return fallback;
  
  return getUserDisplayName(user, fallback);
}

