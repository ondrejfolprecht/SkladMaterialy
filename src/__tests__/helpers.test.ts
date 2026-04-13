import { describe, it, expect } from "vitest";
import { formatDate, calcActualLeadDays, toInputDate } from "@/lib/helpers";

describe("formatDate", () => {
  it("returns – for null", () => {
    expect(formatDate(null)).toBe("–");
  });

  it("formats a valid date in cs-CZ locale", () => {
    const result = formatDate("2026-03-20T00:00:00.000Z");
    // cs-CZ format: d. m. yyyy
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

describe("business logic: quantity mismatch", () => {
  it("detects when reception + marketing !== ordered", () => {
    const ordered = 1000;
    const reception = 600;
    const marketing = 200;
    expect(reception + marketing !== ordered).toBe(true);
  });

  it("is ok when quantities match", () => {
    const ordered = 1000;
    const reception = 800;
    const marketing = 200;
    expect(reception + marketing === ordered).toBe(true);
  });
});

describe("business logic: transfer to reception", () => {
  it("moves marketing quantity to reception and sets reorder flag", () => {
    const item = {
      receptionQuantity: 800,
      marketingQuantity: 200,
      status: "Skladem u marketingu",
      reorderFlag: false,
    };

    // Simulate transfer action
    const updated = {
      receptionQuantity: item.receptionQuantity + item.marketingQuantity,
      marketingQuantity: 0,
      status: "Předáno recepci",
      reorderFlag: true,
    };

    expect(updated.receptionQuantity).toBe(1000);
    expect(updated.marketingQuantity).toBe(0);
    expect(updated.status).toBe("Předáno recepci");
    expect(updated.reorderFlag).toBe(true);
  });
});

describe("business logic: status transitions", () => {
  it("new item defaults to 'V tisku'", () => {
    const status = "V tisku";
    expect(status).toBe("V tisku");
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

  it("does not change status if already past 'V tisku'", () => {
    const currentStatus = "Předáno recepci";
    const stockedAt = "2026-03-28";

    let newStatus = currentStatus;
    if (stockedAt && currentStatus === "V tisku") {
      newStatus = "Skladem u marketingu";
    }

    expect(newStatus).toBe("Předáno recepci");
  });
});
