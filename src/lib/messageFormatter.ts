export const formatMessage = (content: string): string => {
  // Convert markdown-style formatting to HTML
  let formatted = content;

  // Code blocks (```code```)
  formatted = formatted.replace(
    /```(\w+)?\n?([\s\S]*?)```/g,
    '<pre class="code-block"><code class="language-$1">$2</code></pre>'
  );

  // Inline code (`code`)
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  );

  // Bold text (**text**)
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  // Italic text (*text*)
  formatted = formatted.replace(
    /\*(.*?)\*/g,
    '<em>$1</em>'
  );

  // Headers (### text)
  formatted = formatted.replace(
    /^### (.*$)/gm,
    '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
  );

  formatted = formatted.replace(
    /^## (.*$)/gm,
    '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
  );

  // Bullet points (- item or * item)
  formatted = formatted.replace(
    /^[-*] (.+)$/gm,
    '<li class="ml-4">$1</li>'
  );

  // Wrap consecutive li elements in ul
  formatted = formatted.replace(
    /(<li[^>]*>.*<\/li>\s*)+/g,
    '<ul class="list-disc list-outside space-y-1 mb-4">$&</ul>'
  );

  // Numbered lists (1. item)
  formatted = formatted.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4">$1</li>'
  );

  // Links [text](url)
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Blockquotes (> text)
  formatted = formatted.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300 my-2">$1</blockquote>'
  );

  // Convert line breaks to <br> tags
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
};
