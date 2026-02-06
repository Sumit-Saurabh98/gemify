import { cacheFAQSearch, formatFAQContext, getCachedFAQSearch, search } from "./getCachedFAQSearch";

export async function findRelevantFAQs(query: string): Promise<string> {
    // Try cache first
    const cachedResults = await getCachedFAQSearch(query);
    
    if (cachedResults) {
      console.log('✅ FAQ cache hit for query:', query);
      return formatFAQContext(cachedResults);
    }

    // Search in database
    console.log('🔍 Searching FAQs for query:', query);
    const results = await search(query);

    // Cache the results
    await cacheFAQSearch(query, results);

    return formatFAQContext(results);
  }