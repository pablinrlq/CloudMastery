import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";

const expectedCoreSections = { ccp: 21, saa: 33, aif: 15 } as const;
const expectedMinimumFiles = { ccp: 26, saa: 46, aif: 17 } as const;

for (const certId of Object.keys(expectedCoreSections) as Array<keyof typeof expectedCoreSections>) {
  test(`${certId.toUpperCase()} curriculum has valid, ordered premium modules`, () => {
    const directory = path.join(process.cwd(), "content", certId, "modules");
    const files = fs.readdirSync(directory).filter((file) => file.endsWith(".mdx"));
    assert.ok(files.length >= expectedMinimumFiles[certId]);

    const modules = files.map((file) => {
      const raw = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = matter(raw);
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
