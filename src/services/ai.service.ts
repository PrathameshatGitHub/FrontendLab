import { config } from '@/config';
import { getPromptForModule } from '@/utils/prompts';
import OpenAI from 'openai';

// Pre-baked, elite mock responses in case the user doesn't have an API key configured.
// This ensures the application remains fully functional and informative.
const mockResponses: Record<string, string> = {
  'react-query': `### Caching & Stale-While-Revalidate (SWR) in React Query

In a production application, fetching data with raw \`useEffect\` introduces significant architectural hazards:
- **No Shared Cache:** If two components fetch the same product list, they issue duplicate HTTP requests.
- **Race Conditions:** Slow network responses from previous user inputs might overwrite fresh data if the component unmounts.
- **No Stale Invalidation:** Data is loaded once and never updated in the background unless the page is reloaded.

#### React Query (TanStack Query) Architecture
TanStack Query solves this by wrapping fetch requests in a global cache provider:
1. **Deduplication:** Multiple concurrent calls to the same Query Key use a single promise.
2. **Background Refetching:** When queries are marked stale (determined by \`staleTime\`), they are updated silently in the background when the user refocused the window or navigates.
3. **Query States:** Built-in \`isLoading\`, \`isFetching\`, and \`error\` management reduces state boilerplate.

\`\`\`mermaid
sequenceDiagram
    Component->>React Query: useQuery(['products'])
    React Query->>Cache: Look up data
    alt Data in cache and staleTime > 0
        Cache-->>Component: Return cached data (Immediate)
    else Cache empty or Stale
        React Query->>API: fetch('/api/products')
        API-->>React Query: Return fresh products
        React Query->>Cache: Update Cache
        Cache-->>Component: Emit fresh data & trigger rerender
    end
\`\`\`

#### Optimistic Updates Flow
When a vendor adds a product, they don't have to wait for the backend database to respond. React Query lets us immediately inject the product into the UI cache, only performing a rollback if the server responds with an error:
1. **Cancel Queries:** Cancel outbound queries for the query key to avoid overwriting.
2. **Snapshot Cache:** Capture the current cache state.
3. **Optimistically Mutate:** Update the cache using \`queryClient.setQueryData\`.
4. **On Error:** Re-apply the snapshot to restore the previous state.
`,

  'image-optimization': `### Modern Image Optimization Engineering

Loading raw files via standard \`<img>\` tags blocks loading performance:
- **No Format Negotiation:** The browser receives heavy PNGs/JPEGs even if it supports modern formats like WebP or AVIF.
- **Layout Shift (CLS):** Images loaded without specified sizes cause the page elements to jump, degrading visual stability.
- **No Lazy Loading:** Images off-screen are downloaded instantly, wasting user bandwidth.

#### The Next.js \`Image\` Solution
Next.js implements an asset compilation layer that optimizes images at request time:
- **WebP/AVIF Encoding:** Raw images are converted into modern compressed formats.
- **SrcSet Generation:** Next.js generates multiple sizes of the image based on device screens, so mobile users get smaller file sizes.
- **LCP Optimization:** Adding the \`priority\` attribute instructs Next.js to pre-fetch the image in the HTML header, boosting Largest Contentful Paint (LCP) speeds.
- **CLS Prevention:** Forcing explicit \`width\` and \`height\` or using \`fill\` with a ratio placeholder reserves space in the DOM, maintaining Cumulative Layout Shift (CLS) at 0.

\`\`\`mermaid
graph LR
    A[Raw Image on Server] --> B{Next.js Image Loader}
    B -->|Format AVIF/WebP| C[Reduced Payload -80%]
    B -->|Device Size Detection| D[Custom Resolution]
    B -->|Blur Placeholder| E[CLS Prevention & Smooth Hydration]
    C & D & E --> F[Optimized Visual Experience]
\`\`\`
`,

  'state-management': `### Rerender Propagation: Prop Drilling vs. Context API vs. Zustand

State management architecture directly influences React's rendering pipeline. Here is a breakdown of how state propagation behaves under different tools:

#### 1. Prop Drilling (No State Manager)
- **Mechanism:** State resides at a high ancestor component and is passed down via props.
- **Rerender Cost:** Every single intermediate component in the path will rerender, even if it does not consume the state.
- **Complexity:** Hard to maintain for trees deeper than 3 levels.

#### 2. Context API
- **Mechanism:** Context acts as a portal, passing data directly to consumers.
- **Rerender Cost:** When the context value changes (usually an object like \`{ cart, user }\`), **every component consuming the context rerenders**, regardless of which property changed.
- **Mitigation:** Requires splitting contexts into multiple providers or wrapping consumers with \`useMemo\`.

#### 3. Zustand (Pub/Sub Store)
- **Mechanism:** Zustand utilizes an external store outside the React fiber tree. Components subscribe to slice updates via selectors.
- **Rerender Cost:** Only the components that consume the specific property returned by the selector (\`state => state.items\`) will rerender. The intermediate components and other consumers remain unaffected.
- **Performance:** Extremely low rerender count and fast state propagation.

\`\`\`
Rerender Comparison:
State Update -> Context Provider -> Rerenders All Context Consumers (Even unrelated)
State Update -> Zustand Store -> Updates Only Selector Subscribed Leaf Nodes (Optimized!)
\`\`\`
`,

  'rendering': `### Next.js Rendering Architectures

Next.js 15 uses React Server Components (RSC) to split rendering workloads between the server and the client.

#### Rendering Strategies
- **CSR (Client-Side Rendering):** The server sends a blank HTML shell. The client downloads JS, boots up React, fetches data, and renders. High Time-To-Interactive (TTI), poor SEO, but low server cost.
- **SSR (Server-Side Rendering):** The server runs React code on demand, fetches data, compiles the HTML, and sends it to the client. The browser displays static HTML immediately and then **hydrates** (attaches event listeners).
- **SSG (Static Site Generation):** Pages are pre-rendered into static HTML during build time. Fast loading times (assets served from CDNs), but data is static.
- **ISR (Incremental Static Regeneration):** Static pages are regenerated in the background upon requests (e.g. every 60 seconds). Allows static delivery of dynamic content.
- **Streaming & Suspense:** Breaks the HTML into chunks. The server streams layouts immediately, and leaves loading placeholders (Suspense) for slow data. As the server resolves queries, it streams individual HTML chunks down the pipeline. Hydration is completed incrementally.

\`\`\`
Streaming flow:
[Header Layout HTML] (Streamed immediately)
       ↓
[Product Grid Suspense Placeholder] (Displayed on client)
       ↓ (Slow API resolves on server)
[Product Grid HTML + Script Chunks] (Injected into active DOM)
       ↓
[Hydration complete]
\`\`\`
`,

  'hooks': `### Deep-Dive: React Performance Hooks

Performance memoization is a double-edged sword. Here's a breakdown of when they are beneficial and when they add overhead.

#### 1. useMemo & useCallback
- **useMemo:** Caches the *result* of a heavy calculation: \`const val = useMemo(() => compute(a), [a])\`.
- **useCallback:** Caches the *reference* of a function: \`const cb = useCallback(() => handler(b), [b])\`.
- **Overhead:** Memoization isn't free. React must allocate arrays, store references, and execute equality checks on every render. If your function is simple (e.g. sorting a list of 10 items), the checks cost more than rebuilding the function.
- **Rule of Thumb:** Use them when passing callbacks to memoized children (\`React.memo\`) or as dependencies in other hooks.

#### 2. React.memo
- Prevents a child component from rerendering if its props haven't changed.
- Performs a shallow equality check (\`=== \`) on props.
- **Warning:** If you pass an inline function \`() => {}\` or inline object \`{}\` as props without \`useCallback\` / \`useMemo\`, \`React.memo\` will *always* fail its check, making the component rerender *and* run the comparison overhead.
`
};

export async function generateExplanation(moduleName: string, extraContext?: string): Promise<string> {
  const prompt = getPromptForModule(moduleName, extraContext);
  const apiKey = config.geminiApiKey;

  // Fallback to pre-baked responses if no API key is provided
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate networking
    
    // Check specific module fallback
    if (mockResponses[moduleName]) {
      return mockResponses[moduleName];
    }
    
    if (moduleName === 'hooks' && extraContext) {
      return `### React Hooks Analysis: \`${extraContext}\`

The hook \`${extraContext}\` plays a vital role in fine-tuning React's scheduling and render engine.

- **Primary Goal:** Solves responsiveness bottlenecks.
- **Mechanism:** Memoizes computations, schedules priority-based updates, or handles debounced changes.
- **Render Overhead:** Every dependency check triggers a comparison. Make sure you list accurate dependency arrays.
- **Optimization Tip:** Before adding memoization, check if simple state localizations or moving state down can achieve the same goal.
`;
    }
    
    return mockResponses['react-query']; // Default fallback
  }
const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  dangerouslyAllowBrowser: true,
});

try {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // or 'mixtral-8x7b-32768'
    messages: [
      {
        role: 'system',
        content: 'You are an expert Frontend Architect...'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  return completion.choices?.[0]?.message?.content || 'No explanation generated.';
} catch (error) {
  console.error('Groq API call failed:', error);
  return mockResponses[moduleName] || mockResponses['react-query'];
}
}
