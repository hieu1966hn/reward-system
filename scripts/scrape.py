import asyncio
import json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://mindx.edu.vn/center?city=ALL&district=ALL", wait_until="networkidle")
        
        # We need to extract the centers. Let's wait for centers to render.
        # Often they have class names containing "CenterItem" or similar.
        # Or look for 'h3' tags which usually contain the name.
        
        await page.wait_for_timeout(3000) # give it 3s to JS render
        
        centers = await page.evaluate('''
            () => {
                const results = [];
                // Look for elements that might contain detailed info
                // We'll extract text from the entire body to see patterns if needed,
                // but let's try to find address patterns:
                
                // Commonly: center names are in H3 or H4 or strong
                const items = Array.from(document.querySelectorAll('h3, h4'));
                for(const el of items) {
                    const text = el.innerText || '';
                    if (text.includes("MindX") || /^([A-Z][a-zà-ỹ]+ )+/.test(text)) {
                        const parent = el.closest('div');
                        if (parent) {
                            results.push({
                                name: text,
                                raw: parent.innerText
                            });
                        }
                    }
                }
                
                // Sometimes it's structured in specific blocks
                // Let's just grab all divs that have an <a> tag and a map icon, or "Xem bản đồ"
                const mapLinks = Array.from(document.querySelectorAll('a')).filter(a => a.innerText.toLowerCase().includes('bản đồ'));
                const mappedResults = mapLinks.map(a => {
                    let container = a.closest('div, li, article');
                    // go up a few levels to find a container with a lot of text
                    for(let i=0; i<3; i++) {
                        if (container && container.parentElement && container.parentElement.innerText.length < 500) {
                            container = container.parentElement;
                        }
                    }
                    return container ? container.innerText : '';
                });

                return { rawResults: results, mappedResults };
            }
        ''')
        
        with open("raw_centers.json", "w", encoding="utf-8") as f:
            json.dump(centers, f, ensure_ascii=False, indent=2)
            
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
