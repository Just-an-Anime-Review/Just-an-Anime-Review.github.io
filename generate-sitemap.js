const fs = require("fs");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase environment variables are missing.");
}

async function main() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/anime?select=id&order=id.asc`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    if (!response.ok) {
        throw new Error(
            `Supabase request failed: ${response.status}`
        );
    }

    const anime = await response.json();

    const baseUrl =
        "https://just-an-anime-review.github.io";

    const urls = [
        `${baseUrl}/`,
        `${baseUrl}/anime.html`
    ];

    for (const item of anime) {
        if (!item.id) continue;

        urls.push(
            `${baseUrl}/anime-detail.html?id=${encodeURIComponent(item.id)}`
        );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.map(url => `  <url>
    <loc>${escapeXml(url)}</loc>
  </url>`).join("\n")}

</urlset>
`;

    fs.writeFileSync(
        "sitemap.xml",
        xml,
        "utf8"
    );

    console.log(
        `Generated sitemap with ${urls.length} URLs.`
    );
}

function escapeXml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
