const https = require("https");

/**
 * Fetch external events from AllEvents API
 * This is a server-side function (not for React)
 * Uses Node.js https module instead of fetch (for Node.js compatibility)
 * 
 * @returns {Promise<Array>} Array of normalized event objects
 */
function fetchExternalEvents() {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.ALLEVENTS_API_KEY;
    
    if (!apiKey) {
      console.log("ALLEVENTS_API_KEY is not set, skipping AllEvents API");
      resolve([]);
      return;
    }

    try {
      const url = new URL("https://allevents.in/api/v2/events");
      url.searchParams.set("country", "bg");
      url.searchParams.set("page", 1);
      url.searchParams.set("max", 30);
      url.searchParams.set("date", "Future");

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              throw new Error(`AllEvents API failed: ${res.statusCode} ${res.statusMessage} - ${data}`);
            }

            const responseData = JSON.parse(data);
            
            if (!responseData.events || !Array.isArray(responseData.events) || responseData.events.length === 0) {
              console.log("No events found in AllEvents API response");
              resolve([]);
              return;
            }

            // Normalize events to internal format
            const normalizedEvents = responseData.events.map((e) => {
              const location = {
                address: e.venue?.address || e.address || null,
                city: e.venue?.city || e.city || null,
                country: "България",
                coordinates: null,
              };

              const isOnline = !e.venue || 
                               e.venue?.name?.toLowerCase().includes("online") ||
                               e.description?.toLowerCase().includes("online") ||
                               false;

              let price = 0;
              if (e.price) {
                const priceStr = String(e.price).toLowerCase();
                if (priceStr.includes("free") || priceStr.includes("безплат") || priceStr === "0") {
                  price = 0;
                } else {
                  const match = priceStr.match(/(\d+(?:[.,]\d+)?)/);
                  if (match) {
                    price = parseFloat(match[1].replace(',', '.'));
                  }
                }
              }

              // Map category
              let category = e.category || "";
              const categoryLower = category.toLowerCase();
              if (categoryLower.includes("music") || categoryLower.includes("concert") || categoryLower.includes("музика")) {
                category = "Култура";
              } else if (categoryLower.includes("sport") || categoryLower.includes("спорт")) {
                category = "Спорт";
              } else if (categoryLower.includes("workshop") || categoryLower.includes("работилница")) {
                category = "Работилници";
              } else if (categoryLower.includes("family") || categoryLower.includes("kids") || categoryLower.includes("деца")) {
                category = "Деца";
              } else if (categoryLower.includes("charity") || categoryLower.includes("благотворител")) {
                category = "Благотворителни";
              } else if (!category) {
                category = "Култура";
              }

              return {
                id: `ext_${e.id}`,
                title: e.eventname || e.title || "Без заглавие",
                description: e.description || "",
                category: category,
                location: location,
                startDate: e.start_time || null,
                endDate: e.end_time || null,
                durationMinutes: null,
                imageUrl: e.thumb_url || e.banner_url || e.image_url || null,
                websiteUrl: e.url || e.event_url || null,
                price: price,
                isOnline: isOnline,
                createdAt: e.created || new Date().toISOString(),
                creatorId: null,
                tags: [],
                isExternal: true,
              };
            });

            // Filter out past events - remove events where both startDate and endDate are in the past
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Set to start of day for comparison
            
            const validEvents = normalizedEvents.filter(event => {
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

            console.log(`Loaded ${validEvents.length} valid external events from AllEvents (out of ${normalizedEvents.length} total)`);
            resolve(validEvents);
          } catch (parseError) {
            console.error("Error parsing AllEvents API response:", parseError);
            resolve([]); // Return empty array on parse error
          }
        });
      });

      req.on("error", (error) => {
        console.error("Error fetching external events from AllEvents:", error);
        resolve([]); // Return empty array on error, don't reject
      });

      req.end();
    } catch (error) {
      console.error("Error setting up AllEvents API request:", error);
      resolve([]); // Return empty array on error
    }
  });
}

module.exports = { fetchExternalEvents };
