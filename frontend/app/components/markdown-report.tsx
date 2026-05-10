import { cleanText } from "./format";
import type { ReactNode } from "react";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function headingId(text: string) {
  return cleanText(text, 180)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function MarkdownReport({ markdown }: { markdown?: string | null }) {
  const lines = String(markdown ?? "").split(/\r?\n/);
  const elements: ReactNode[] = [];
  let bullets: string[] = [];

  function flushBullets() {
    if (!bullets.length) {
      return;
    }
    elements.push(
      <ul key={`ul-${elements.length}`}>
        {bullets.map((item, index) => (
          <li key={index}>{inline(cleanText(item, 900))}</li>
        ))}
      </ul>
    );
    bullets = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushBullets();
      continue;
    }
    if (line.startsWith("|") && line.endsWith("|")) {
      flushBullets();
      const tableRows = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const row = lines[index]
          .trim()
          .slice(1, -1)
          .split("|")
          .map((cell) => cleanText(cell, 240));
        if (!row.every((cell) => /^:?-+:?$/.test(cell.replace(/\s/g, "")))) {
          tableRows.push(row);
        }
        index += 1;
      }
      index -= 1;
      elements.push(
        <table key={`table-${elements.length}`}>
          <tbody>
            {tableRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) =>
                  rowIndex === 0 ? (
                    <th key={cellIndex}>{inline(cell)}</th>
                  ) : (
                    <td key={cellIndex}>{inline(cell)}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }
    if (line.startsWith("### ")) {
      flushBullets();
      const title = cleanText(line.slice(4), 180);
      elements.push(<h3 id={headingId(title)} key={index}>{title}</h3>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushBullets();
      const title = cleanText(line.slice(3), 180);
      elements.push(<h2 id={headingId(title)} key={index}>{title}</h2>);
      continue;
    }
    if (line.startsWith("# ")) {
      flushBullets();
      const title = cleanText(line.slice(2), 180);
      elements.push(<h1 id={headingId(title)} key={index}>{title}</h1>);
      continue;
    }
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      continue;
    }
    flushBullets();
    elements.push(<p key={index}>{inline(cleanText(line, 1200))}</p>);
  }

  flushBullets();

  return <article className="reportArticle">{elements}</article>;
}
