import { describe, expect, it } from "vitest";
import {
  cortexDatasetRevisionCreateSchema,
  cortexModelCreateSchema,
  cortexModelVersionCreateSchema,
} from "./registry";

describe("Cortex registries", () => {
  it("accepts provider-backed model metadata", () => {
    expect(
      cortexModelCreateSchema.parse({
        name: "Qwen",
        slug: "qwen",
        provider: "huggingface",
        externalId: "Qwen/Qwen3-14B",
      }).provider
    ).toBe("huggingface");
  });
  it("rejects unsafe registry slugs", () => {
    expect(() => cortexModelCreateSchema.parse({ name: "Bad", slug: "../bad", provider: "local" })).toThrow();
  });
  it("accepts immutable model and dataset artifact references", () => {
    expect(
      cortexModelVersionCreateSchema.parse({ version: "v1", artifactUri: "hf://org/model" }).artifactUri
    ).toBe("hf://org/model");
    expect(
      cortexDatasetRevisionCreateSchema.parse({
        revision: "2026-09-18",
        artifactUri: "s3://bucket/data.parquet",
        rowCount: 10,
      }).rowCount
    ).toBe(BigInt(10));
  });
});
