import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { parseFrontmatter } from "../src/lib/learning/frontmatter.ts";

const expectedCoreSections = { ccp: 21, saa: 33, aif: 15 } as const;
const expectedMinimumFiles = { ccp: 26, saa: 46, aif: 17 } as const;

type TestFrontmatter = {
  title: string;
  description: string;
  domain: string;
  order: number;
  durationMinutes: number;
  type: string;
};

for (const certId of Object.keys(expectedCoreSections) as Array<keyof typeof expectedCoreSections>) {
  test(`${certId.toUpperCase()} curriculum has valid, ordered premium modules`, () => {
    const directory = path.join(process.cwd(), "content", certId, "modules");
    const files = fs.readdirSync(directory).filter((file) => file.endsWith(".mdx"));
    assert.ok(files.length >= expectedMinimumFiles[certId]);

    const modules = files.map((file) => {
      const raw = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = parseFrontmatter<TestFrontmatter>(raw);
      assert.equal(typeof data.title, "string");
      assert.ok(data.title.length > 5);
      assert.equal(typeof data.description, "string");
      assert.ok(data.description.length > 20);
      assert.equal(typeof data.domain, "string");
      assert.ok(Number.isInteger(data.order) && data.order > 0);
      assert.ok(Number.isInteger(data.durationMinutes) && data.durationMinutes > 0);
      assert.ok(["teoria", "lab", "revisao"].includes(data.type));
      assert.match(content, /^\s*##\s+/m);
      return data as { order: number };
    });

    const orders = modules.map((module) => module.order);
    assert.equal(new Set(orders).size, orders.length, "module orders must be unique");

    for (let order = 1; order <= expectedCoreSections[certId]; order++) {
      assert.ok(orders.includes(order), `missing core section ${order}`);
    }
  });
}

// The course page compiles each module at request time, so a stray "<1s" or "{"
// only shows up as a server error for whoever opens that module.
test("every module compiles as MDX like the course page does", async () => {
  const failures: string[] = [];
  for (const certId of Object.keys(expectedCoreSections)) {
    const directory = path.join(process.cwd(), "content", certId, "modules");
    for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".mdx"))) {
      const { content } = parseFrontmatter(fs.readFileSync(path.join(directory, file), "utf8"));
      try {
        await serialize(content, { mdxOptions: { remarkPlugins: [remarkGfm] } });
      } catch (error) {
        failures.push(`${certId}/${file}: ${String((error as Error).message).split("\n")[1] ?? error}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
