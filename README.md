# enterprise-infographic-platform
enterprise infographic platform . AI → Structured Visual AST → SVG → Native Editable PPTX

## End-to-end artifact validation

A simple test script is available to generate a 2026 DevSecOps workflow infographic, save an SVG preview, and export an editable PPTX deck.

Artifacts are written to `output/artifacts`.

Run from the `backend` folder:

```bash
cd backend
npm run e2e:artifacts
```

You can also override the provider:

```bash
PROVIDER=gemini npm run e2e:artifacts
```
