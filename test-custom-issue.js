"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
var s1 = zod_1.z.object({ a: zod_1.z.string(), b: zod_1.z.string() }).superRefine(function (data, ctx) {
    ctx.addIssue({
        code: "custom",
        message: "Password tidak cocok s1",
        path: ["b"],
        input: data
    });
});
var s2 = zod_1.z.object({ a: zod_1.z.string(), b: zod_1.z.string() }).superRefine(function (data, ctx) {
    ctx.addIssue({
        code: zod_1.z.ZodIssueCode.custom,
        message: "Password tidak cocok s2",
        path: ["b"],
    });
});
try {
    s1.parse({ a: "1", b: "2" });
}
catch (e) {
    console.log("s1 error:", JSON.stringify(e.issues, null, 2));
}
try {
    s2.parse({ a: "1", b: "2" });
}
catch (e) {
    console.log("s2 error:", JSON.stringify(e.issues, null, 2));
}
