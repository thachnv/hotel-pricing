import React from "react";
import { formatPrice } from "./App";

test("Format price should work correctly", () => {
  expect(formatPrice(100.21, "USD")).toBe("100");
  expect(formatPrice(300123.22, "KRW")).toBe("300,100");
});
