const https = require("https");
const http = require("http");

/**
 * Fetch a single page and return HTML content
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch page: ${res.statusCode}`));
        return;
      }
      
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    }).on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Extract image from event detail page
 */
async function extractImageFromDetailPage(eventUrl) {
  try {
    if (!eventUrl) return null;
    
    const html = await fetchPage(eventUrl);
    
    // Look for main event image
    const imgPatterns = [
      /<img[^>]+class="[^"]*event[^"]*"[^>]+src=["']([^"']+)["']/i,
      /<img[^>]+class="[^"]*main[^"]*"[^>]+src=["']([^"']+)["']/i,
      /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))["']/i,
    ];
    
    for (const pattern of imgPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let imageUrl = match[1];
        if (!imageUrl.startsWith("http")) {
          imageUrl = imageUrl.startsWith("/") 
            ? `https://visit.varna.bg${imageUrl}`
            : `https://visit.varna.bg/${imageUrl}`;
        }
        return imageUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to extract image from ${eventUrl}:`, error.message);
    return null;
  }
}

/**
 * Extract total number of pages from HTML
 * @param {string} html - HTML content
 * @returns {number} Total number of pages
 */
function extractTotalPages(html) {
  try {
    let maxPage = 1;
    
    // Method 1: Find all page numbers in URLs like "events/2.html", "events/3.html"
    const urlPattern = /events\/(\d+)\.html/g;
    let match;
    while ((match = urlPattern.exec(html)) !== null) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
    
    // Method 2: Look for pagination section with page numbers
    // Find pagination area (usually contains links to other pages)
    const paginationSection = html.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi);
    if (paginationSection) {
      paginationSection.forEach(section => {
        // Extract all numbers from this section
        const numbers = section.match(/>(\d+)</g);
        if (numbers) {
          numbers.forEach(numStr => {
            const num = parseInt(numStr.replace(/[><]/g, ''), 10);
            if (num > maxPage && num < 100) { // Reasonable limit
              maxPage = num;
            }
          });
        }
      });
    }
    
    // Method 3: Look for "You're on page X" text (from the website structure)
    const pageTextMatch = html.match(/You're on page (\d+)/i);
    if (pageTextMatch) {
      const pageNum = parseInt(pageTextMatch[1], 10);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
    
    // Method 4: Look for pagination links in href attributes
    const hrefPattern = /href=["']([^"']*events[^"']*\/(\d+)\.html[^"']*)["']/gi;
    while ((match = hrefPattern.exec(html)) !== null) {
      const pageNum = parseInt(match[2], 10);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
    
    // Ensure at least 1 page
    if (maxPage < 1) {
      maxPage = 1;
    }
    
    console.log(`Detected ${maxPage} total pages`);
    return maxPage;
  } catch (error) {
    console.warn("Error extracting page count, defaulting to 1:", error.message);
    return 1;
  }
}

/**
 * Scrape events from visit.varna.bg
 * @returns {Promise<Array>} Array of normalized event objects
 */
async function scrapeVarnaEvents() {
  return new Promise(async (resolve, reject) => {
    const baseUrl = "https://visit.varna.bg/bg";
    const firstPageUrl = `${baseUrl}/event.html`;
    
    console.log("Starting to scrape Varna events from:", firstPageUrl);
    
    try {
      // Fetch first page to determine total pages
      const firstPageHtml = await fetchPage(firstPageUrl);
      console.log(`Received ${firstPageHtml.length} bytes of HTML from first page`);
      
      const totalPages = extractTotalPages(firstPageHtml);
      console.log(`Found ${totalPages} pages to scrape`);
      
      // Parse events from first page
      let allEvents = parseVarnaEventsHTML(firstPageHtml);
      console.log(`Parsed ${allEvents.length} events from page 1`);
      
      // Scrape remaining pages (2, 3, 4, etc.)
      // Use a fallback approach: try pages until we get an error or empty page
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 2; // Stop after 2 consecutive errors
      
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = `${baseUrl}/events/${page}.html`;
        console.log(`Fetching page ${page}/${totalPages}: ${pageUrl}`);
        
        try {
          const pageHtml = await fetchPage(pageUrl);
          console.log(`Received ${pageHtml.length} bytes of HTML from page ${page}`);
          
          // Check if page has content (not just error page)
          if (pageHtml.length < 1000) {
            console.log(`Page ${page} seems empty or error page, stopping`);
            break;
          }
          
          const pageEvents = parseVarnaEventsHTML(pageHtml);
          console.log(`Parsed ${pageEvents.length} events from page ${page}`);
          
          if (pageEvents.length === 0) {
            console.log(`No events found on page ${page}, might be the last page`);
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              console.log(`Stopping after ${consecutiveErrors} consecutive empty pages`);
              break;
            }
          } else {
            consecutiveErrors = 0; // Reset error counter
          }
          
          allEvents = [...allEvents, ...pageEvents];
          
          // Small delay between pages to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (pageError) {
          console.warn(`Error fetching page ${page}:`, pageError.message);
          consecutiveErrors++;
          
          // If we've had too many consecutive errors, stop trying
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.log(`Stopping after ${consecutiveErrors} consecutive errors`);
            break;
          }
          
          // Continue with next page even if one fails
          continue;
        }
      }
      
      console.log(`Total events scraped from all pages: ${allEvents.length}`);
      
      // Try to extract images from detail pages for events without images
      // Limit to first 5 events to avoid too many requests
      for (let i = 0; i < Math.min(allEvents.length, 5); i++) {
        if (!allEvents[i].imageUrl && allEvents[i].websiteUrl) {
          console.log(`Trying to extract image for event: ${allEvents[i].title}`);
          const imageUrl = await extractImageFromDetailPage(allEvents[i].websiteUrl);
          if (imageUrl) {
            allEvents[i].imageUrl = imageUrl;
            console.log(`Found image for "${allEvents[i].title}": ${imageUrl}`);
          }
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      resolve(allEvents);
    } catch (error) {
      console.error("Error scraping Varna events:", error);
      reject(error);
    }
  });
}

/**
 * Parse HTML and extract events
 * @param {string} html - HTML content
 * @returns {Array} Array of event objects
 */
function parseVarnaEventsHTML(html) {
  const events = [];
  
  console.log("Parsing HTML for events...");
  
  // Based on the website structure, each event is in a <div class="list-element"> container
  // Structure:
  // <div class="grid-x grid-padding-x list-element">
  //   <div class="large-3"> - contains image
  //     <img src="..." data-src="...">
  //   </div>
  //   <div class="large-9"> - contains title and details
  //     <h2>Title</h2>
  //   </div>
  //   <hr>
  // </div>
  
  // Split by list-element divs
  const listElementPattern = /<div[^>]*class="[^"]*list-element[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<hr>/gi;
  const listElements = [];
  let match;
  
  while ((match = listElementPattern.exec(html)) !== null) {
    listElements.push(match[1]); // The content inside the list-element div
  }
  
  // Fallback: if no list-elements found, try splitting by <hr> tags after h2 sections
  if (listElements.length === 0) {
    console.log("No list-element divs found, trying fallback method with h2 sections");
    const h2Sections = html.split(/<h2[^>]*>/);
    for (let i = 1; i < h2Sections.length; i++) {
      const section = h2Sections[i];
      const hrIndex = section.indexOf("<hr");
      if (hrIndex > 0) {
        listElements.push(section.substring(0, hrIndex));
      } else {
        listElements.push(section);
      }
    }
  }
  
  console.log(`Found ${listElements.length} event list elements`);
  
  // Process each list element
  for (let i = 0; i < listElements.length; i++) {
    const listElement = listElements[i];
    
    // Extract image URL FIRST - from the large-3 cell (before h2)
    let imageUrl = null;
    
    // Look for img tag in the list element - prefer data-src (lazy loading), then src
    const imgWithDataSrc = listElement.match(/<img[^>]+data-src=["']([^"']+)["']/i);
    if (imgWithDataSrc) {
      imageUrl = imgWithDataSrc[1];
    } else {
      const imgWithSrc = listElement.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgWithSrc) {
        imageUrl = imgWithSrc[1];
      }
    }
    
    // Make absolute URL if relative
    if (imageUrl && !imageUrl.startsWith("http")) {
      if (imageUrl.startsWith("/")) {
        imageUrl = `https://visit.varna.bg${imageUrl}`;
      } else {
        imageUrl = `https://visit.varna.bg/${imageUrl}`;
      }
    }
    
    // Extract title from h2 tag
    const titleMatch = listElement.match(/<h2[^>]*>([^<]+)<\/h2>/);
    if (!titleMatch) continue;
    
    let title = titleMatch[1]
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .trim();
    
    // Skip navigation and non-event titles
    if (title.includes("Събития") || 
        title.includes("Меню") || 
        title.includes("Открий Варна") ||
        title.length < 5 ||
        title.match(/^\d+$/)) { // Skip page numbers
      continue;
    }
    
    // Extract date range - look for Bulgarian date format DD.MM.YYYY
    const datePattern = /(\d{1,2}\.\d{1,2}\.\d{4})/g;
    const dates = [];
    let dateMatch;
    while ((dateMatch = datePattern.exec(listElement)) !== null) {
      dates.push(dateMatch[1]);
    }
    
    let startDate = null;
    let endDate = null;
    
    if (dates.length >= 1) {
      startDate = parseBulgarianDate(dates[0]);
      if (dates.length >= 2) {
        endDate = parseBulgarianDate(dates[1]);
      } else {
        // Try to find end date in different format or use start date
        endDate = startDate;
      }
    }
    
    // Extract location and description from divs and paragraphs
    const contentDivs = listElement.match(/<div[^>]*>([\s\S]*?)<\/div>/g);
    let location = null;
    let description = "";
    
    if (contentDivs) {
      for (const divMatch of contentDivs) {
        const content = divMatch
          .replace(/<[^>]+>/g, " ") // Remove HTML tags
          .replace(/&nbsp;/g, " ")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/&nd\.\.\./g, "...") // Fix &nd... entity
          .replace(/\s+/g, " ")
          .trim();
        
        if (content.length > 10 && !content.includes("прочети повече")) {
          description += (description ? " " : "") + content;
          
          // Try to extract location (contains venue keywords)
          const locationKeywords = ["музей", "галерия", "театър", "опера", "хотел", "ул.", "улица", "зала", "център"];
          if (locationKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            // Extract location - usually first sentence or part before comma
            const locationParts = content.split(/[.,;]/);
            location = locationParts[0].trim();
            if (location.length < 5) {
              location = content.substring(0, 100).trim();
            }
          }
        }
      }
    }
    
    // Extract link if available - look for event links
    const linkMatch = listElement.match(/href="([^"]*event[^"]*\.html[^"]*)"/i);
    let link = null;
    if (linkMatch) {
      link = linkMatch[1].startsWith("http") 
        ? linkMatch[1] 
        : `https://visit.varna.bg${linkMatch[1]}`;
    }
    
    // Only add if we have at least a title
    if (title && title.length > 3) {
      // Don't add if date is too far in the past (more than 1 year)
      const eventDate = startDate ? new Date(startDate) : new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (eventDate < oneYearAgo) {
        console.log(`Skipping event "${title}" - date too old: ${startDate}`);
        continue;
      }
      
      // Validate image URL - skip placeholder or decorative images
      if (imageUrl) {
        const skipPatterns = [
          /logo/i,
          /icon/i,
          /placeholder/i,
          /spacer/i,
          /pixel/i,
          /1x1/i,
          /blank/i
        ];
        
        const shouldSkip = skipPatterns.some(pattern => pattern.test(imageUrl));
        if (shouldSkip) {
          console.log(`Skipping decorative/placeholder image for "${title}": ${imageUrl}`);
          imageUrl = null;
        }
      }
      
      // Generate stable ID based on title and start date (so favorites work correctly)
      // This ensures the same event always has the same ID
      let stableId = null;
      if (title && startDate) {
        // Create a hash-like ID from title and date
        const titleHash = title
          .toLowerCase()
          .replace(/[^a-z0-9а-я]/g, '')
          .substring(0, 30);
        const dateHash = startDate.substring(0, 10).replace(/-/g, '');
        stableId = `varna_${titleHash}_${dateHash}`;
      } else if (title) {
        // Fallback if no date
        const titleHash = title
          .toLowerCase()
          .replace(/[^a-z0-9а-я]/g, '')
          .substring(0, 30);
        stableId = `varna_${titleHash}`;
      } else {
        // Last resort - use timestamp (shouldn't happen)
        stableId = `varna_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      events.push({
        id: stableId,
        title: title,
        description: description || title,
        startDate: startDate || new Date().toISOString(), // Use current date if no date found
        endDate: endDate || startDate || new Date().toISOString(),
        location: {
          address: location || null,
          city: "Варна",
          country: "България",
          coordinates: null
        },
        category: categorizeEvent(title, description),
        price: 0, // Usually not specified on the site
        isOnline: false,
        imageUrl: imageUrl,
        websiteUrl: link,
        isExternal: true,
        createdAt: new Date().toISOString(),
        creatorId: null,
        tags: []
      });
      
      console.log(`Added event: "${title}" - Date: ${startDate || 'N/A'} - Image: ${imageUrl ? 'Yes' : 'No'}`);
    }
  }
  
  console.log(`Total events parsed: ${events.length}`);
  
  // Filter out past events - remove events where both startDate and endDate are in the past
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day for comparison
  
  const validEvents = events.filter(event => {
    if (!event.startDate) {
      console.log(`Skipping event "${event.title}" - no start date`);
      return false;
    }
    
    try {
      const startDate = new Date(event.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      // Check if start date is in the past
      if (startDate < now) {
        // If start date is past, check end date
        if (event.endDate) {
          const endDate = new Date(event.endDate);
          endDate.setHours(0, 0, 0, 0);
          
          // If end date is also in the past, skip this event
          if (endDate < now) {
            console.log(`Skipping past event "${event.title}" - start: ${event.startDate}, end: ${event.endDate}`);
            return false;
          }
        } else {
          // No end date, but start date is past - skip
          console.log(`Skipping past event "${event.title}" - start: ${event.startDate} (no end date)`);
          return false;
        }
      }
      
      // Event is valid (either start date is in future, or end date is in future)
      return true;
    } catch (error) {
      console.log(`Skipping event "${event.title}" - date parsing error:`, error);
      return false;
    }
  });
  
  console.log(`Scraped ${events.length} events from visit.varna.bg, ${validEvents.length} are future events`);
  if (validEvents.length > 0) {
    console.log("Sample valid events:", validEvents.slice(0, 3).map(e => ({ 
      title: e.title, 
      startDate: e.startDate,
      endDate: e.endDate,
      hasDate: !!e.startDate 
    })));
  }
  
  return validEvents;
}

/**
 * Parse Bulgarian date format (DD.MM.YYYY) to ISO string
 */
function parseBulgarianDate(dateString) {
  try {
    const parts = dateString.split(".");
    if (parts.length !== 3) {
      console.warn(`Invalid date format: ${dateString}`);
      return new Date().toISOString();
    }
    
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    const date = new Date(`${year}-${month}-${day}`);
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.warn(`Error parsing date ${dateString}:`, error);
    return new Date().toISOString();
  }
}

/**
 * Categorize event based on title and description
 */
function categorizeEvent(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes("изложба") || text.includes("галерия") || text.includes("арт")) {
    return "Култура";
  }
  if (text.includes("музика") || text.includes("концерт") || text.includes("фестивал") || text.includes("опера")) {
    return "Култура";
  }
  if (text.includes("театър") || text.includes("спектакъл")) {
    return "Култура";
  }
  if (text.includes("спорт") || text.includes("маратон") || text.includes("турнир")) {
    return "Спорт";
  }
  if (text.includes("работилница") || text.includes("курс") || text.includes("обучение")) {
    return "Работилници";
  }
  if (text.includes("деца") || text.includes("детски") || text.includes("семейно")) {
    return "Деца";
  }
  
  return "Култура"; // Default
}

module.exports = { scrapeVarnaEvents };

