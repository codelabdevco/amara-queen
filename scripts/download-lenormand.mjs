import { writeFileSync, existsSync } from "fs";
import { join } from "path";

const DIR = join(import.meta.dirname, "..", "public", "cards", "lenormand");

// Lenormand cards from Wikimedia Commons (public domain - Dondorf deck)
const CARDS = [
  { name: "01_rider", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Lenormand-Reiter.jpg/200px-Lenormand-Reiter.jpg" },
  { name: "02_clover", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Lenormand-Klee.jpg/200px-Lenormand-Klee.jpg" },
  { name: "03_ship", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Lenormand-Schiff.jpg/200px-Lenormand-Schiff.jpg" },
  { name: "04_house", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lenormand-Haus.jpg/200px-Lenormand-Haus.jpg" },
  { name: "05_tree", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lenormand-Baum.jpg/200px-Lenormand-Baum.jpg" },
  { name: "06_clouds", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Lenormand-Wolken.jpg/200px-Lenormand-Wolken.jpg" },
  { name: "07_snake", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Lenormand-Schlange.jpg/200px-Lenormand-Schlange.jpg" },
  { name: "08_coffin", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Lenormand-Sarg.jpg/200px-Lenormand-Sarg.jpg" },
  { name: "09_bouquet", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Lenormand-Blumen.jpg/200px-Lenormand-Blumen.jpg" },
  { name: "10_scythe", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Lenormand-Sense.jpg/200px-Lenormand-Sense.jpg" },
  { name: "11_whip", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Lenormand-Ruten.jpg/200px-Lenormand-Ruten.jpg" },
  { name: "12_birds", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Lenormand-V%C3%B6gel.jpg/200px-Lenormand-V%C3%B6gel.jpg" },
  { name: "13_child", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Lenormand-Kind.jpg/200px-Lenormand-Kind.jpg" },
  { name: "14_fox", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Lenormand-Fuchs.jpg/200px-Lenormand-Fuchs.jpg" },
  { name: "15_bear", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Lenormand-B%C3%A4r.jpg/200px-Lenormand-B%C3%A4r.jpg" },
  { name: "16_stars", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Lenormand-Sterne.jpg/200px-Lenormand-Sterne.jpg" },
  { name: "17_stork", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Lenormand-St%C3%B6rche.jpg/200px-Lenormand-St%C3%B6rche.jpg" },
  { name: "18_dog", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lenormand-Hund.jpg/200px-Lenormand-Hund.jpg" },
  { name: "19_tower", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Lenormand-Turm.jpg/200px-Lenormand-Turm.jpg" },
  { name: "20_garden", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Lenormand-Park.jpg/200px-Lenormand-Park.jpg" },
  { name: "21_mountain", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Lenormand-Berg.jpg/200px-Lenormand-Berg.jpg" },
  { name: "22_crossroads", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lenormand-Wege.jpg/200px-Lenormand-Wege.jpg" },
  { name: "23_mice", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Lenormand-M%C3%A4use.jpg/200px-Lenormand-M%C3%A4use.jpg" },
  { name: "24_heart", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Lenormand-Herz.jpg/200px-Lenormand-Herz.jpg" },
  { name: "25_ring", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lenormand-Ring.jpg/200px-Lenormand-Ring.jpg" },
  { name: "26_book", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lenormand-Buch.jpg/200px-Lenormand-Buch.jpg" },
  { name: "27_letter", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Lenormand-Brief.jpg/200px-Lenormand-Brief.jpg" },
  { name: "28_gentleman", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Lenormand-Herr.jpg/200px-Lenormand-Herr.jpg" },
  { name: "29_lady", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Lenormand-Dame.jpg/200px-Lenormand-Dame.jpg" },
  { name: "30_lily", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Lenormand-Lilien.jpg/200px-Lenormand-Lilien.jpg" },
  { name: "31_sun", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Lenormand-Sonne.jpg/200px-Lenormand-Sonne.jpg" },
  { name: "32_moon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Lenormand-Mond.jpg/200px-Lenormand-Mond.jpg" },
  { name: "33_key", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Lenormand-Schl%C3%BCssel.jpg/200px-Lenormand-Schl%C3%BCssel.jpg" },
  { name: "34_fish", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Lenormand-Fische.jpg/200px-Lenormand-Fische.jpg" },
  { name: "35_anchor", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Lenormand-Anker.jpg/200px-Lenormand-Anker.jpg" },
  { name: "36_cross", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lenormand-Kreuz.jpg/200px-Lenormand-Kreuz.jpg" },
];

async function download(card) {
  const filepath = join(DIR, card.name + ".jpg");
  if (existsSync(filepath)) { console.log(`  [skip] ${card.name}`); return card.name; }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000));
      const res = await fetch(card.url, { headers: { "User-Agent": "AmaraQueen/1.0" } });
      if (res.status === 429) { console.log(`  [429] ${card.name} retry...`); continue; }
      if (!res.ok) { console.log(`  [${res.status}] ${card.name}`); return null; }
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(filepath, buf);
      console.log(`  [done] ${card.name} (${(buf.length/1024).toFixed(0)}KB)`);
      return card.name;
    } catch(e) { if (attempt === 2) { console.log(`  [fail] ${card.name}: ${e.message}`); return null; } }
  }
  return null;
}

console.log(`Downloading ${CARDS.length} Lenormand cards...`);
const results = [];
for (const card of CARDS) {
  results.push(await download(card));
  await new Promise(r => setTimeout(r, 1500));
}
const ok = results.filter(Boolean).length;
console.log(`Done: ${ok}/${CARDS.length}`);
