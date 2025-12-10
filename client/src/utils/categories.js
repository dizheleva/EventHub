// Category definitions with emojis
export const CATEGORIES = [
  { value: "Деца", label: "Деца 👶", emoji: "👶" },
  { value: "Култура", label: "Култура 🎭", emoji: "🎭" },
  { value: "Спорт", label: "Спорт ⚽", emoji: "⚽" },
  { value: "Работилници", label: "Работилници 🎨", emoji: "🎨" },
  { value: "Сезонни", label: "Сезонни 🎃", emoji: "🎃" },
  { value: "Благотворителни", label: "Благотворителни 🤝", emoji: "🤝" },
];

// Get category emoji by value
export function getCategoryEmoji(categoryValue) {
  if (!categoryValue) return "❓";
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.emoji : "❓";
}

// Get category label with emoji by value
export function getCategoryLabel(categoryValue) {
  if (!categoryValue) return "❓ Други";
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : "❓ Други";
}

// Get category display text (emoji + name)
export function getCategoryDisplay(categoryValue) {
  if (!categoryValue) return "❓ Други";
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? `${category.emoji} ${category.value}` : "❓ Други";
}

// Format event price
export function formatEventPrice(price) {
  if (price === 0 || price === null || price === undefined) {
    return "Безплатно";
  }
  return `${price} лв.`;
}

