// Format price with Euro symbol
// Converts BGN to EUR (approximate rate: 1 EUR = 1.96 BGN)
// If price is "Безплатно" or contains "безплатно", returns it as is
export function formatPrice(priceString) {
  if (!priceString) return "€0";
  
  const lowerPrice = priceString.toLowerCase();
  
  // If it's free, return as is
  if (lowerPrice.includes("безплатно") || lowerPrice.includes("безплатн")) {
    return "Безплатно";
  }
  
  // Extract numeric value from price string
  const numericMatch = priceString.match(/(\d+(?:[.,]\d+)?)/);
  if (!numericMatch) {
    // If no number found, return with euro symbol after
    return `${priceString} €`;
  }
  
  const numericValue = parseFloat(numericMatch[1].replace(',', '.'));
  
  // If it's already in BGN (contains "лв", "bgn", "лева"), convert to EUR
  if (lowerPrice.includes("лв") || lowerPrice.includes("bgn") || lowerPrice.includes("лева")) {
    // Convert BGN to EUR (1 EUR = 1.96 BGN)
    const eurValue = (numericValue / 1.96).toFixed(2);
    return `${eurValue} €`;
  }
  
  // If no currency specified, assume it's already in EUR or add euro symbol
  if (lowerPrice.includes("€") || lowerPrice.includes("eur") || lowerPrice.includes("евро")) {
    // If already has euro symbol, move it to the end if it's at the start
    if (priceString.startsWith('€')) {
      return priceString.replace('€', '').trim() + ' €';
    }
    return priceString;
  }
  
  // Default: add euro symbol after
  return `${numericValue.toFixed(2)} €`;
}

