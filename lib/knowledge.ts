import fs from 'fs';
import path from 'path';

let cachedKnowledge: string | null = null;

export function loadKnowledgeBase(): string {
  if (cachedKnowledge) return cachedKnowledge;

  const knowledgeDir = path.join(process.cwd(), 'knowledge');

  if (!fs.existsSync(knowledgeDir)) {
    return '';
  }

  const files = fs.readdirSync(knowledgeDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const sections = files.map(file => {
    const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
    return `\n\n---\n## Bestand: ${file}\n\n${content}`;
  });

  cachedKnowledge = sections.join('');
  return cachedKnowledge;
}

export function clearKnowledgeCache() {
  cachedKnowledge = null;
}
