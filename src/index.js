export default {
  async fetch(request, env, ctx) {
    // Trả về 404 cho các request không khớp với tài nguyên tĩnh (static assets)
    return new Response("Not Found", { status: 404 });
  },
};
