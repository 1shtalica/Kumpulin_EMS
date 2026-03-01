import { z } from "zod";

const s1 = z.object({a: z.string(), b: z.string()}).superRefine((data, ctx) => {
  ctx.addIssue({
    code: "custom",
    message: "Password tidak cocok s1",
    path: ["b"],
    input: data
  });
});

const s2 = z.object({a: z.string(), b: z.string()}).superRefine((data, ctx) => {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Password tidak cocok s2",
    path: ["b"],
  });
});

try {
    s1.parse({a: "1", b: "2"});
} catch(e: any) {
    console.log("s1 error:", JSON.stringify(e.issues, null, 2));
}

try {
    s2.parse({a: "1", b: "2"});
} catch(e: any) {
    console.log("s2 error:", JSON.stringify(e.issues, null, 2));
}
