export const fetchProducts = async (search: string, latency: number): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mock = Array.from({ length: 5 }, (_, i) => `Product ${i + 1} - ${search}`);
      resolve(mock);
    }, latency);
  });
};
