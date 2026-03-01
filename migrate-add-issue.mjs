import fs from 'fs';

for (const file of ['lib/validator/auth.ts', 'lib/validator/create-event.ts']) {
    let content = fs.readFileSync(file, 'utf8');

    // Simple replacement approach:
    // replacing code: z.ZodIssueCode.custom
    // with code: "custom",\n        input: data
    
    // First, standard replace:
    content = content.replace(/code:\s*z\.ZodIssueCode\.custom,?/g, 'code: "custom",\n        input: data');
    
    fs.writeFileSync(file, content);
    console.log(`Updated addIssue calls in ${file}`);
}
