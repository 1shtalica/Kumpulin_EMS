import fs from 'fs';

const authPath = 'lib/validator/auth.ts';
let auth = fs.readFileSync(authPath, 'utf8');

auth = auth.replace(/\{ message:/g, '{ error:');
auth = auth.replace(/\{\n\s*message:/g, '{\n        error:');
auth = auth.replace(/ctx\.addIssue\(\{\n\s*path: \["confirmPassword"\],\n\s*error:/g, 'ctx.addIssue({\n        path: ["confirmPassword"],\n        message:');

// email fixes
auth = auth.replace(
  /z\s*\n\s*\.string\(\)\s*\n\s*\.min\(([^,]+),\s*\{\s*error:\s*"([^"]+)"\s*\}\)\s*\n\s*\.email\(\{\s*error:\s*"([^"]+)"\s*\}\)/g,
  'z\n      .email({ error: "$3" })\n      .min($1, { error: "$2" })'
);
auth = auth.replace(
  /z\s*\n\s*\.string\(\)\s*\n\s*\.min\(([^,]+),\s*\{\s*error:\s*"([^"]+)"\s*\}\)\s*\n\s*\.email\(\{\s*error:\s*"([^"]+)"\s*\}\)/g,
  'z\n    .email({ error: "$3" })\n    .min($1, { error: "$2" })'
);

fs.writeFileSync(authPath, auth);
console.log('auth.ts transformed');
