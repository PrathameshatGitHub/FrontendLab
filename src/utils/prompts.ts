export const promptTemplates = {
  default: (context: string) => `
You are an expert Frontend Architect and Vercel Principal Engineer.
Provide a production-level, concise, and structured analysis of the following concept:
"${context}"

Focus on:
1. **Underlying Architecture**: How does the react render engine handle this?
2. **Performance Profile**: Rerenders, hydration costs, memory footprint, and network payloads.
3. **Best Practices**: What are the trade-offs of the legacy vs. modern approach?
4. **Scalability Guidelines**: When does this technique break down and how to solve it?

Format the response in neat, professional Markdown using bullet points, short paragraphs, and a modern clean design.
`,

  reactQuery: () => `
Explain TanStack React Query vs. legacy useEffect for data fetching.
Structure your answer like a Senior Frontend Architect:
- **The Core Issue**: What makes useEffect data fetching brittle (race conditions, memory leaks, lack of global caching, loading waterfalls)?
- **React Query Benefits**: Explain caching, deduplication of concurrent requests, staleTime, and automatic refetching.
- **Optimistic Updates**: Detail how optimistic updates are implemented using cache manipulation (queryClient.setQueryData) and how to rollback on failure.
- **Render Profile**: How does React Query minimize component rerenders compared to local useState-based fetching?
`,

  imageOptimization: () => `
Explain modern Image Optimization in Next.js.
Compare:
1. **Raw <img> tag**: Why it causes Layout Shift (CLS), slow LCP, download of massive uncompressed payloads, and lacks lazy loading.
2. **Next.js <Image> component**: Discuss how Next.js optimizes images dynamically (format conversion to WebP/AVIF, resizing based on device width using 'sizes', lazy loading by default, and preventing layout shifts with forced aspect ratios or placeholders).
Discuss how edge-cached assets improve LCP and overall Core Web Vitals.
`,

  stateManagement: () => `
Compare Prop Drilling, Context API, and Zustand (Centralized Store) in terms of performance and scale.
Detail:
- **Prop Drilling**: The maintenance overhead and why it's bad for large trees, though it has zero extra react context overhead.
- **Context API**: Explain why it causes unnecessary rerenders for all consumer components when any property in the context value changes, and how to mitigate it (splitting contexts, useMemo values).
- **Zustand & Selectors**: How Zustand avoids context rerenders using a pub-sub model and fine-grained selectors (\`useStore(state => state.property)\`).
Include a brief diagram of render propagation.
`,

  rendering: () => `
Compare CSR, SSR, SSG, ISR, and Streaming Suspense in Next.js 15.
- **CSR (Client-Side Rendering)**: Empty HTML, heavy JS bundle, high time-to-interactive, zero server CPU load but poor SEO.
- **SSR (Server-Side Rendering)**: HTML generated per-request. Better SEO and initial load, but blocks TTFB while fetching server-side data.
- **SSG (Static Site Generation)**: Pre-compiled HTML at build time. Extreme speed (CDN cached), zero server cost, but static.
- **ISR (Incremental Static Regeneration)**: Dynamic regeneration on-demand without full rebuild. Ideal for blogs/e-commerce.
- **Streaming & Suspense**: Explain selective hydration and streaming HTML chunks to the browser as they resolve, preventing slow APIs from blocking the entire page render.
`,

  hooks: (hookName: string) => `
Analyze the React hook: "${hookName}".
Explain:
- **What it solves**: The problem of expensive computations, reference comparison failures, or UI blocking.
- **How it works**: Deep dive into React's internal fiber node comparisons or scheduler.
- **When NOT to use it**: Explain the overhead of memory allocations and comparator arrays, and why wrapping every function in useCallback is an anti-pattern.
- **Alternatives**: For virtualization or transition, compare them with standard rendering.
`
};

export function getPromptForModule(moduleName: string, extraContext?: string): string {
  switch (moduleName) {
    case 'react-query':
      return promptTemplates.reactQuery();
    case 'image-optimization':
      return promptTemplates.imageOptimization();
    case 'state-management':
      return promptTemplates.stateManagement();
    case 'rendering':
      return promptTemplates.rendering();
    case 'hooks':
      return promptTemplates.hooks(extraContext || 'useMemo');
    default:
      return promptTemplates.default(moduleName);
  }
}
