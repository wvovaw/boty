export default {
  writeJson: async (path: string, data: Record<string, unknown>) => {
    try {
      return await Deno.writeTextFile(path, JSON.stringify(data));
    } catch (e) {
      return e.message;
    }
  },

  readJson: async (path: string) => {
    try {
      return await JSON.parse(await Deno.readTextFile(path));
    } catch (e) {
      return e.message;
    }
  },

  range: (start: number, end: number) =>
    [...Array(1 + end - start).keys()].map((item) => item + start),

  paginate: (arr: any[], per_page: number, page: number): any[] =>
    arr.slice((page - 1) * per_page, page * per_page),
};
