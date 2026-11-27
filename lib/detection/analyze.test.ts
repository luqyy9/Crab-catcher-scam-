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

describe("chat and scenario detection", () => {
  const scamChat = [
    "[27/11/2026, 10:31 PM] Sarah Lim (+60 11-2233 4455): Hi dear, I'm from Shopee customer service. Your parcel is stuck at customs and needs a clearance fee.",
    "[27/11/2026, 10:32 PM] Sarah Lim: Please transfer RM85 to Maybank 512345678901 (Tan Mei Ling) and send me the receipt.",
    "[27/11/2026, 10:34 PM] Sarah Lim: After that I will send the refund. Don't tell anyone about this yet, our system is under audit.",
    "[27/11/2026, 10:35 PM] Sarah Lim: Also send me the 6-digit code you receive by SMS so I can verify your account.",
  ].join("\n");

  it("scores a scam chat as high risk even with no link", () => {
    const result = analyzeText(scamChat, "en");
    const ids = result.signals.map((signal) => signal.id);
    const scenarios = result.scenarios.map((scenario) => scenario.id);

    expect(result.level).toBe("high");
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(ids).toContain("scenario.otp_theft");
    expect(ids).toContain("scenario.money_transfer");
    expect(scenarios).toContain("scenario.parcel_fee");
  });

  it("flags OTP theft in a short friendly message", () => {
    const result = analyzeText(
      "Hi, this is Maybank. We detected a login on your account. Please send me the OTP you just received.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.otp_theft");
  });

  it("flags an investment scam without a link", () => {
    const result = analyzeText(
      "Join our VIP trading group. Members make a guaranteed 18% profit every week with zero risk. Minimum capital RM500, top up today.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.investment");
  });

  it("flags a paid-task job scam that asks for a top-up", () => {
    const result = analyzeText(
      "Part-time job: complete simple Shopee orders and earn RM30 per task. Top up RM100 to unlock your commission and withdraw your earnings.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.job_task");
  });

  it("flags a money-mule request", () => {
    const result = analyzeText(
      "I can pay you RM500 if you let me use your bank account to receive a payment, then transfer it to another account.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.money_mule");
  });

  it("flags a police 'safe account' scam", () => {
    const result = analyzeText(
      "I am Officer Lim from PDRM. Your account is linked to money laundering. Transfer your money to a safe account for investigation.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.safe_account");
  });

  it("flags an overpayment refund scam", () => {
    const result = analyzeText(
      "I accidentally transferred RM500 to your account instead of RM50. Please send back the difference.",
      "en",
    );
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.overpayment");
  });

  it("flags a sextortion threat", () => {
    const result = analyzeText(
      "I have your photos. Pay RM2000 or I will share them with your family.",
      "en",
    );
    expect(result.level).toBe("high");
    expect(result.scenarios.map((scenario) => scenario.id)).toContain("scenario.sextortion");
  });

  it("keeps an ordinary chat low risk", () => {
    const result = analyzeText(
      "[27/11/2026, 3:00 PM] Aisyah: Hi, are we still meeting at the library at 5?\n[27/11/2026, 3:02 PM] Me: Yes, see you there. I'll bring the notes.",
      "en",
    );
    expect(result.level).toBe("low");
    expect(result.scenarios).toHaveLength(0);
  });

  it("does not treat a small personal transfer as a scam", () => {
    const result = analyzeText("Hi, can you transfer RM50 for the pizza? I'll pay you back tonight.", "en");
    expect(result.level).toBe("low");
    expect(result.scenarios).toHaveLength(0);
  });

  it("does not raise a short personal chat about splitting a bill", () => {
    const result = analyzeText(
      "[3:00 PM] Ali: I paid for dinner, transfer RM50 when you are free.\n[3:05 PM] Me: Sure, will do.",
      "en",
    );
    expect(result.scenarios).toHaveLength(0);
    expect(result.level).toBe("low");
  });
});

describe("levenshtein", () => {
  it("computes edit distance", () => {
    expect(levenshtein("maybank", "maybnak")).toBe(2);
    expect(levenshtein("cimb", "cimb")).toBe(0);
  });
});
