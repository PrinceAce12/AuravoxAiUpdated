export const formatMessage = (content: string): string => {
  let formatted = content;

  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const fixIncompleteCodeBlocks = (code: string, language: string): string => {
    if (language === 'php' || language === '') {
      const hasClosingTag = code.includes('?>');
      const hasOpeningTag = code.includes('<?php') || code.includes('<?=');
      if (hasClosingTag && !hasOpeningTag) {
        code = '<?php\n' + code;
      }
    }

    if (language === 'html' && code.includes('</') && !code.includes('<')) {
      code = '<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n' + code + '\n</body>\n</html>';
    }

    return escapeHTML(code.trim());
  };

  // Format fenced code blocks (```lang\ncode```)
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_, language = 'text', code) => {
      const fixedCode = fixIncompleteCodeBlocks(code, language);
      return `
    <div class="relative my-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-auto border border-gray-300 dark:border-gray-700">
      <span class="absolute left-0 top-0 px-3 py-1 text-lg font-extrabold tracking-wide" style="background: transparent; color: #1a1a1a; z-index: 10;">
        <span class="dark:hidden">${language.toUpperCase()}</span>
        <span class="hidden dark:inline" style="color: #fafafa;">${language.toUpperCase()}</span>
      </span>
      <pre class="px-4 py-9 text-sm leading-relaxed overflow-x-auto" style="margin-top:0.5em;"><code class="language-${language}">${fixedCode}</code></pre>
    </div>`;
    }
  );

  // Handle unfinished code blocks
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)$/g,
    (_, language = 'text', code) => {
      const fixedCode = fixIncompleteCodeBlocks(code, language);
      return `
    <div class="relative my-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-auto border border-gray-300 dark:border-gray-700">
      <span class="absolute left-0 top-0 px-3 py-1 text-lg font-extrabold tracking-wide" style="background: transparent; color: #1a1a1a; z-index: 10;">
        <span class="dark:hidden">${language.toUpperCase()}</span>
        <span class="hidden dark:inline" style="color: #fafafa;">${language.toUpperCase()}</span>
      </span>
      <pre class="px-4 py-3 text-sm leading-relaxed overflow-x-auto" style="margin-top:0.5em;"><code class="language-${language}">${fixedCode}</code></pre>
    </div>`;
    }
  );

  // Inline code
  formatted = formatted.replace(
    /`([^`\n]+?)`/g,
    (_, code) => `<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">${escapeHTML(code)}</code>`
  );

  // Links [text](url)
  formatted = formatted.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g,
    `<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>`
  );

  // Blockquotes
  formatted = formatted.replace(
    /^> (.+)$/gm,
    `<blockquote class="border-l-4 border-blue-400 dark:border-blue-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4">${'$1'}</blockquote>`
  );

  // Headers
  formatted = formatted
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');

  // Bold and italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Lists
  formatted = formatted.replace(/^[-*] (.+)$/gm, '<li class="ml-4">$1</li>');
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="ml-4">$1</li>');

  // Wrap <li> blocks
  formatted = formatted.replace(
    /((<li class="ml-4">.*?<\/li>\s*)+)/g,
    match => {
      const isOrdered = /^\d+\. /.test(match);
      const tag = isOrdered ? 'ol' : 'ul';
      return `<${tag} class="list-${isOrdered ? 'decimal' : 'disc'} list-outside space-y-1 my-4">${match}</${tag}>`;
    }
  );

  // Convert line breaks
  formatted = formatted.replace(/\n{2,}/g, '</p><p>');
  formatted = `<p>${formatted.replace(/\n/g, '<br>')}</p>`;

  return formatted;
  
};
