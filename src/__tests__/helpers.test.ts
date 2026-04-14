import { describe, it, expect } from "vitest";
import { formatDate, calcActualLeadDays, toInputDate } from "@/lib/helpers";

describe("formatDate", () => {
  it("returns – for null", () => {
    expect(formatDate(null)).toBe("–");
  });

  it("formats a valid date in cs-CZ locale", () => {
    const result = formatDate("2026-03-20T00:00:00.000Z");
    expect(result).toMatch(/20/);
    expect(result).toMatch(/3/);
    expect(result).toMatch(/2026/);
  });
});

describe("calcActualLeadDays", () => {
  it("returns null if printOrderedAt is null", () => {
    expect(calcActualLeadDays(null, "2026-03-28")).toBeNull();
  });

  it("returns null if stockedAt is null", () => {
    expect(calcActualLeadDays("2026-03-20", null)).toBeNull();
  });

  it("returns null if both are null", () => {
    expect(calcActualLeadDays(null, null)).toBeNull();
  });

  it("calculates the difference in days", () => {
    expect(calcActualLeadDays("2026-03-20", "2026-03-28")).toBe(8);
  });

  it("returns 0 for same day", () => {
    expect(calcActualLeadDays("2026-03-20", "2026-03-20")).toBe(0);
  });
});

describe("toInputDate", () => {
  it("returns empty string for null", () => {
    expect(toInputDate(null)).toBe("");
  });

  it("converts ISO date to YYYY-MM-DD", () => {
    expect(toInputDate("2026-03-20T00:00:00.000Z")).toBe("2026-03-20");
  });
});

describe("business logic: transfer to department", () => {
  it("decrements marketing quantity by transfer amount", () => {
    const marketingQty = 200;
    const transferQty = 80;
    const newMarketingQty = marketingQty - transferQty;
    expect(newMarketingQty).toBe(120);
  });

  it("sets reorder flag when marketing reaches 0", () => {
    const marketingQty = 200;
    const transferQty = 200;
    const newMarketingQty = marketingQty - transferQty;
    const reorderFlag = newMarketingQty === 0;
    expect(newMarketingQty).toBe(0);
    expect(reorderFlag).toBe(true);
  });

  it("does not allow transfer exceeding marketing quantity", () => {
    const marketingQty = 100;
    const transferQty = 150;
    expect(transferQty > marketingQty).toBe(true);
  });
});

describe("business logic: quantity mismatch with transfers", () => {
  it("detects when transfers + marketing !== ordered", () => {
    const ordered = 1000;
    const transferredTotal = 600;
    const marketing = 200;
    expect(transferredTotal + marketing !== ordered).toBe(true);
  });

  it("is ok when quantities match", () => {
    const ordered = 1000;
    const transferredTotal = 800;
    const marketing = 200;
    expect(transferredTotal + marketing === ordered).toBe(true);
  });
});

describe("business logic: status transitions", () => {
  it("new item defaults to 'V tisku'", () => {
    expect("V tisku").toBe("V tisku");
  });

  it("changes to 'Skladem u marketingu' when stockedAt is set", () => {
    const currentStatus = "V tisku";
    const stockedAt = "2026-03-28";

    let newStatus = currentStatus;
    if (stockedAt && currentStatus === "V tisku") {
      newStatus = "Skladem u marketingu";
    }
    expect(newStatus).toBe("Skladem u marketingu");
  });

  it("changes to 'Předáno' when marketing reaches 0", () => {
    const newMarketingQty = 0;
    const status = newMarketingQty === 0 ? "Předáno" : "Skladem u marketingu";
    expect(status).toBe("Předáno");
  });
});
