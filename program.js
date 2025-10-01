// process-md.js
import fs from "fs";
import readline from "readline";

/**
 * Remove <p... "p"> ... </p>-like stuff
 */
function removePTag(line) {
  if (line.includes("<p")) {
    return line.replace(/<p[^>]*"p">/g, "\n");
  }
  return line;
}

/**
 * Remove <ul... "ul">
 */
function removeUlTag(line) {
  if (line.includes("<ul")) {
    return line.replace(/<ul[^>]*"ul">/g, "\n");
  }
  return line;
}

/**
 * Replace <li className="li"> with a new line + " - "
 */
function convertLiClass(line) {
  return line.replace(/<li[^>]*className="li"[^>]*>/g, "\n - ");
}

/**
 * Remove </li>
 */
function removeLi(line) {
  return line.replace(/<\/li>/g, "\n");
}

/**
 * Remove </ul>
 */
function removeUl(line) {
  return line.replace(/<\/ul>/g, "\n");
}

/**
 * Convert <a className="xref" href="...">text</a>
 * into [text](href)
 */
function convertAnchor(line) {
  return line.replace(
    /<a[^>]*className="xref"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g,
    (_, href, text) => `[${text}](${href})`
  );
}

/**
 * Remove <div ...>
 */
function removeDiv(line) {
  return line.replace(/<div[^>]*>/g, "");
}

/**
 * Convert <span className="note__title">Some text</span>
 * into **Some text**
 */
function convertNoteSpan(line) {
  return line.replace(
    /<span[^>]*className="note__title"[^>]*>(.*?)<\/span>/g,
    (_, text) => `**${text.trim()}**`
  );
}

/**
 * Convert <a id="id_1" class="anchor_top_offset"/>Some text
 * into [Some text](#)
 */
function convertAnchorWithId(line) {
  return line.replace(
    /<a[^>]*id="[^"]*"[^>]*class="anchor_top_offset"[^>]*\/>(.*)/g,
    (_, text) => `${text.trim()}`
  );
}

/**
 * Remove </div>
 */
function removeDivClose(line) {
  return line.replace(/<\/div>/g, "");
}

/**
 * Remove </p>
 */
function removePClose(line) {
  return line.replace(/<\/p>/g, "");
}

/**
 * Convert <em className="ph i">...</em>
 * into _..._
 */
function convertEmphasis(line) {
  return line.replace(
    /<em[^>]*className="ph i"[^>]*>(.*?)<\/em>/g,
    (_, text) => `_${text}_`
  );
}

/**
 * Convert <a className="xref j-external-link" href="URL" target="_blank">Text</a>
 * into [Text]("URL")
 */
function convertExternalLink(line) {
  return line.replace(
    /<a[^>]*className="xref j-external-link"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g,
    (_, href, text) => `[${text}]("${href}")`
  );
}

/**
 * Convert <strong ...>Text</strong>
 * into **Text**
 */
function convertStrong(line) {
  return line.replace(
    /<strong[^>]*>(.*?)<\/strong>/g,
    (_, text) => `**${text}**`
  );
}

// === Main Processing ===
async function processFile(inputFile, outputFile) {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity,
  });

  const outStream = fs.createWriteStream(outputFile);

  for await (let line of rl) {
    line = removePTag(line);
    line = removeUlTag(line);      // updated logic for <ul... "ul">
    line = convertLiClass(line);   // new <li className="li"> rule
    line = removeLi(line);
    line = removeUl(line);
    line = convertAnchor(line);
    line = removeDiv(line);
    line = convertNoteSpan(line);
    line = convertAnchorWithId(line);
    line = removeDivClose(line);    // NEW
    line = removePClose(line);      // NEW
    line = convertNoteSpan(line);
    line = convertAnchorWithId(line);
    line = convertEmphasis(line);   // NEW
    line = convertExternalLink(line); // NEW
    line = convertStrong(line);     // NEW


    outStream.write(line + "\n");
  }

  outStream.end();
  console.log(`Processed file saved to: ${outputFile}`);
}

// Example usage
processFile("file.md", "output.md");
