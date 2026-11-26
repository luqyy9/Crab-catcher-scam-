import { describe, expect, it } from "vitest";
import { analyzeText } from "./analyze";
import { levenshtein } from "./urls";

const ids = (text: string) => analyzeText(text, "en").signals.map((signal) => signal.id);

describe("analyzeText", () => {
  it("flags the classic bank suspension message as high risk", () => {
    const result = analyzeText(
      "Your bank account will be suspended within 2 hours. Click here to verify your account.",
      "en",
    );

    expect(result.level).toBe("high");
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.signals.map((signal) => signal.id)).toEqual(
      expect.arrayContaining(["urgency.language", "threat.consequence", "credential.request"]),
    );
  });

  it("treats an ordinary library notice as low risk", () => {
    const result = analyzeText(
      "Hi, this is Aisyah from the IIUM library. Your reserved book is ready for pickup at counter 2 until Friday. No payment is needed, just bring your matric card.",
      "en",
    );

    expect(result.level).toBe("low");
    expect(result.score).toBeLessThan(30);
  });

  it("does not flag a normal message with a local phone number", () => {
    const result = analyzeText("Please call me back at +60123456789 about the meeting tomorrow.", "en");
    expect(result.level).toBe("low");
  });

  it("detects brand impersonation on a fake domain", () => {
    const result = analyzeText(
      "Maybank: your account is locked. Verify at http://maybank-secure-verify.xyz/login now.",
      "en",
    );

    expect(ids("Maybank: verify at http://maybank-secure-verify.xyz/login")).toContain(
      "link.brand_mismatch",
    );
    expect(result.level).toBe("high");
    expect(result.urls[0]?.host).toBe("maybank-secure-verify.xyz");
  });

  it("de-obfuscates hxxp and [.] links", () => {
    const result = analyzeText(
      "Pos Malaysia: pay the fee at hxxp://posmalaysia[.]secure-pay[.]top/pay today.",
      "en",
    );

    expect(result.urls).toHaveLength(1);
    expect(result.urls[0].display).toBe("http://posmalaysia.secure-pay.top/pay");
    expect(result.level).toBe("high");
  });

  it("flags raw IP address links", () => {
    const result = analyzeText("Verify your account at http://203.0.113.5/login immediately.", "en");
    expect(result.signals.map((signal) => signal.id)).toContain("link.ip_host");
  });

  it("flags userinfo tricks that hide the real host", () => {
    const result = analyzeText("Login: https://maybank.com@evil.xyz/login", "en");
    expect(result.signals.map((signal) => signal.id)).toContain("link.userinfo");
    expect(result.urls[0].host).toBe("evil.xyz");
  });

  it("catches leetspeak lookalike domains", () => {
    const result = analyzeText("Your PayPal is limited. Confirm at http://paypa1.com/login", "en");
    const found = result.signals.map((signal) => signal.id);
    expect(found.includes("link.lookalike") || found.includes("link.brand_mismatch")).toBe(true);
  });

  it("flags punycode domains", () => {
    const result = analyzeText("Confirm at https://xn--mybank-9va.com/login", "en");
    expect(result.signals.map((signal) => signal.id)).toContain("link.punycode");
  });

  it("detects Bahasa Melayu urgency and threats", () => {
    const result = analyzeText(
      "SEGERA: Akaun Maybank anda akan digantung dalam masa 2 jam. Klik di sini untuk mengesahkan akaun anda: http://maybank-verify.xyz",
      "ms",
    );

    expect(result.level).toBe("high");
    expect(result.lang).toBe("ms");
    expect(result.verificationSteps.length).toBeGreaterThan(2);
  });

  it("returns a span that points at the evidence", () => {
    const text = "Your account will be suspended within 24 hours.";
    const result = analyzeText(text, "en");
    const threat = result.signals.find((signal) => signal.id === "threat.consequence");
    expect(threat).toBeDefined();

    const span = threat!.spans[0];
    expect(text.slice(span.start, span.end).toLowerCase()).toContain("suspended");
  });

  it("keeps every result explainable", () => {
    const result = analyzeText("URGENT!!! You have won RM10,000. Click here: http://claim-prize.top", "en");
    for (const signal of result.signals) {
      expect(signal.spans.every((span) => span.end > span.start)).toBe(true);
    }
  });
});

describe("levenshtein", () => {
  it("computes edit distance", () => {
    expect(levenshtein("maybank", "maybnak")).toBe(2);
    expect(levenshtein("cimb", "cimb")).toBe(0);
  });
});
